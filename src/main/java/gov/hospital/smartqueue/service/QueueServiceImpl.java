package gov.hospital.smartqueue.service;

import gov.hospital.smartqueue.dto.*;
import gov.hospital.smartqueue.model.*;
import gov.hospital.smartqueue.notification.NotificationService;
import gov.hospital.smartqueue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QueueServiceImpl implements QueueService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private VisitRepository visitRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public TokenResponseDTO generateToken(TokenRequestDTO requestDTO) {
        Patient patient = patientRepository.findById(requestDTO.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + requestDTO.getPatientId()));

        Doctor doctor = doctorRepository.findById(requestDTO.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + requestDTO.getDoctorId()));

        Appointment appointment = null;
        if (requestDTO.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(requestDTO.getAppointmentId()).orElse(null);
            if (appointment != null) {
                appointment.setStatus(Appointment.AppointmentStatus.TOKEN_GENERATED);
                appointmentRepository.save(appointment);
            }
        }

        // Auto upgrade priority if patient is senior or pregnant and priority was normal
        Priority priority = requestDTO.getPriority();
        if (priority == Priority.NORMAL) {
            if (Boolean.TRUE.equals(patient.getIsSeniorCitizen()) || Boolean.TRUE.equals(patient.getIsPregnant()) || (patient.getAge() != null && patient.getAge() >= 60)) {
                priority = Priority.SENIOR_OR_PREGNANT;
            }
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayCount = tokenRepository.countByCreatedAtGreaterThanEqual(startOfDay) + 1;
        
        // Generate Token Code format e.g. DOC1-001 or EMG-002
        String prefix = priority == Priority.EMERGENCY ? "EMG" : "D" + doctor.getId();
        String tokenNo = String.format("%s-%03d", prefix, todayCount);

        Token token = Token.builder()
                .tokenNo(tokenNo)
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .priority(priority)
                .status(TokenStatus.WAITING)
                .isWalkIn(requestDTO.getIsWalkIn() != null ? requestDTO.getIsWalkIn() : true)
                .createdAt(LocalDateTime.now())
                .build();

        token = tokenRepository.save(token);

        // Recalculate waiting times and broadcast
        recalculateWaitingTimes(doctor.getId());
        broadcastQueueUpdate(doctor.getId());

        // Send SMS notification
        int pos = getPatientPositionInQueue(doctor.getId(), token.getId());
        int waitEst = pos * doctor.getAvgConsultMinutes();
        notificationService.sendQueueAlert(
                patient.getPhone(),
                patient.getName(),
                token.getTokenNo(),
                doctor.getName(),
                doctor.getRoomNo(),
                pos,
                waitEst
        );

        return mapToDTO(token, pos, waitEst);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorQueueStateDTO getLiveQueueForDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorId));

        List<Token> waitingTokens = tokenRepository.findWaitingQueueByDoctor(doctorId);
        Optional<Token> calledTokenOpt = tokenRepository.findFirstByDoctorIdAndStatusOrderByCalledAtDesc(doctorId, TokenStatus.CALLED);

        TokenResponseDTO calledDTO = calledTokenOpt.map(t -> mapToDTO(t, 0, 0)).orElse(null);

        List<TokenResponseDTO> waitingDTOs = new ArrayList<>();
        int avgConsult = doctor.getAvgConsultMinutes() != null ? doctor.getAvgConsultMinutes() : 10;
        for (int i = 0; i < waitingTokens.size(); i++) {
            Token t = waitingTokens.get(i);
            int estWait = (i + 1) * avgConsult;
            waitingDTOs.add(mapToDTO(t, i + 1, estWait));
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long completedToday = tokenRepository.countByDoctorIdAndStatusAndCreatedAtBetween(doctorId, TokenStatus.COMPLETED, startOfDay, endOfDay);

        return DoctorQueueStateDTO.builder()
                .doctorId(doctor.getId())
                .doctorName(doctor.getName())
                .department(doctor.getDepartment())
                .roomNo(doctor.getRoomNo())
                .avgConsultMinutes(avgConsult)
                .currentlyCalled(calledDTO)
                .waitingQueue(waitingDTOs)
                .totalWaiting(waitingTokens.size())
                .totalCompletedToday((int) completedToday)
                .build();
    }

    @Override
    public TokenResponseDTO callNextToken(Long doctorId) {
        // Complete or clear any previously called token if doctor forgot to complete it
        Optional<Token> currentCalled = tokenRepository.findFirstByDoctorIdAndStatusOrderByCalledAtDesc(doctorId, TokenStatus.CALLED);
        currentCalled.ifPresent(token -> {
            token.setStatus(TokenStatus.COMPLETED);
            token.setCompletedAt(LocalDateTime.now());
            tokenRepository.save(token);
        });

        // Get prioritized queue
        List<Token> queue = tokenRepository.findWaitingQueueByDoctor(doctorId);
        if (queue.isEmpty()) {
            broadcastQueueUpdate(doctorId);
            return null;
        }

        Token nextToken = queue.get(0);
        nextToken.setStatus(TokenStatus.CALLED);
        nextToken.setCalledAt(LocalDateTime.now());
        nextToken = tokenRepository.save(nextToken);

        // Recalculate remaining
        recalculateWaitingTimes(doctorId);
        broadcastQueueUpdate(doctorId);

        // Notify patient their turn is NOW
        notificationService.sendSms(
                nextToken.getPatient().getPhone(),
                String.format("URGENT: Token [%s] is CALLED! Please proceed immediately to Doctor Room %s (%s).",
                        nextToken.getTokenNo(), nextToken.getDoctor().getRoomNo(), nextToken.getDoctor().getName())
        );

        // Alert the 2nd patient in line
        if (queue.size() > 1) {
            Token upcoming = queue.get(1);
            notificationService.sendQueueAlert(
                    upcoming.getPatient().getPhone(),
                    upcoming.getPatient().getName(),
                    upcoming.getTokenNo(),
                    upcoming.getDoctor().getName(),
                    upcoming.getDoctor().getRoomNo(),
                    1,
                    upcoming.getDoctor().getAvgConsultMinutes()
            );
        }

        return mapToDTO(nextToken, 0, 0);
    }

    @Override
    public TokenResponseDTO completeCurrentToken(Long doctorId, Long tokenId, String diagnosis, String prescription, String vitals, String followUp) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        token.setStatus(TokenStatus.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());
        tokenRepository.save(token);

        // Create and save patient visit record
        Visit visit = Visit.builder()
                .patient(token.getPatient())
                .doctor(token.getDoctor())
                .token(token)
                .diagnosisNotes(diagnosis)
                .prescription(prescription)
                .vitals(vitals)
                .followUpDate(followUp)
                .visitDate(LocalDateTime.now())
                .build();
        visitRepository.save(visit);

        if (token.getAppointment() != null) {
            token.getAppointment().setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(token.getAppointment());
        }

        recalculateWaitingTimes(doctorId);
        broadcastQueueUpdate(doctorId);

        return mapToDTO(token, 0, 0);
    }

    @Override
    public TokenResponseDTO markNoShow(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenId));

        token.setStatus(TokenStatus.NO_SHOW);
        tokenRepository.save(token);

        Long doctorId = token.getDoctor().getId();
        recalculateWaitingTimes(doctorId);
        broadcastQueueUpdate(doctorId);

        return mapToDTO(token, 0, 0);
    }

    @Override
    public TokenResponseDTO moveNoShowToEnd(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenId));

        // Reset to waiting with updated time so it sits at the end of its priority class
        token.setStatus(TokenStatus.WAITING);
        token.setCreatedAt(LocalDateTime.now());
        tokenRepository.save(token);

        Long doctorId = token.getDoctor().getId();
        recalculateWaitingTimes(doctorId);
        broadcastQueueUpdate(doctorId);

        return mapToDTO(token, 0, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TokenResponseDTO> getTodayNoShows() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<Token> noShows = tokenRepository.findByStatusAndCreatedAtBetween(TokenStatus.NO_SHOW, start, end);
        return noShows.stream().map(t -> mapToDTO(t, 0, 0)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        long totalTokens = tokenRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long totalCompleted = tokenRepository.countByStatusAndCreatedAtBetween(TokenStatus.COMPLETED, startOfDay, endOfDay);
        long totalNoShows = tokenRepository.countByStatusAndCreatedAtBetween(TokenStatus.NO_SHOW, startOfDay, endOfDay);
        long totalWaiting = tokenRepository.countByStatusAndCreatedAtBetween(TokenStatus.WAITING, startOfDay, endOfDay);
        long totalPatients = patientRepository.count();

        List<Doctor> doctors = doctorRepository.findAll();
        Map<String, Long> perDept = new HashMap<>();
        Map<String, Long> perDoctor = new HashMap<>();

        for (Doctor doc : doctors) {
            long count = tokenRepository.countByDoctorIdAndCreatedAtBetween(doc.getId(), startOfDay, endOfDay);
            perDoctor.put(doc.getName() + " (" + doc.getDepartment() + ")", count);
            perDept.put(doc.getDepartment(), perDept.getOrDefault(doc.getDepartment(), 0L) + count);
        }

        return DashboardStatsDTO.builder()
                .date(LocalDate.now())
                .totalPatientsToday(totalPatients)
                .totalTokensGeneratedToday(totalTokens)
                .totalCompletedToday(totalCompleted)
                .totalNoShowsToday(totalNoShows)
                .totalWaitingCurrently(totalWaiting)
                .tokensPerDepartment(perDept)
                .tokensPerDoctor(perDoctor)
                .build();
    }

    @Override
    public void broadcastQueueUpdate(Long doctorId) {
        DoctorQueueStateDTO state = getLiveQueueForDoctor(doctorId);
        messagingTemplate.convertAndSend("/topic/queue/" + doctorId, state);
        messagingTemplate.convertAndSend("/topic/queue/all", state);
    }

    private void recalculateWaitingTimes(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) return;

        int avgConsult = doctor.getAvgConsultMinutes() != null ? doctor.getAvgConsultMinutes() : 10;
        List<Token> queue = tokenRepository.findWaitingQueueByDoctor(doctorId);

        for (int i = 0; i < queue.size(); i++) {
            Token t = queue.get(i);
            t.setEstimatedWaitMinutes((i + 1) * avgConsult);
            tokenRepository.save(t);
        }
    }

    private int getPatientPositionInQueue(Long doctorId, Long tokenId) {
        List<Token> queue = tokenRepository.findWaitingQueueByDoctor(doctorId);
        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getId().equals(tokenId)) {
                return i + 1;
            }
        }
        return 1;
    }

    private TokenResponseDTO mapToDTO(Token t, int position, int estWait) {
        return TokenResponseDTO.builder()
                .id(t.getId())
                .tokenNo(t.getTokenNo())
                .patientId(t.getPatient().getId())
                .patientName(t.getPatient().getName())
                .patientPhone(t.getPatient().getPhone())
                .patientAge(t.getPatient().getAge())
                .patientGender(t.getPatient().getGender())
                .doctorId(t.getDoctor().getId())
                .doctorName(t.getDoctor().getName())
                .department(t.getDoctor().getDepartment())
                .roomNo(t.getDoctor().getRoomNo())
                .priority(t.getPriority())
                .priorityLabel(t.getPriority().getDisplayName())
                .status(t.getStatus())
                .estimatedWaitMinutes(estWait > 0 ? estWait : (t.getEstimatedWaitMinutes() != null ? t.getEstimatedWaitMinutes() : 0))
                .queuePosition(position)
                .createdAt(t.getCreatedAt())
                .calledAt(t.getCalledAt())
                .build();
    }
}
