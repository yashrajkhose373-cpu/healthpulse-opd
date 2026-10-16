package gov.hospital.smartqueue.config;

import gov.hospital.smartqueue.model.*;
import gov.hospital.smartqueue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepo,
            DoctorRepository doctorRepo,
            PatientRepository patientRepo,
            TokenRepository tokenRepo,
            AppointmentRepository appointmentRepo,
            VisitRepository visitRepo) {

        return args -> {
            if (userRepo.count() > 0) {
                return; // Seed only if empty
            }

            // 1. Create Default Users (Admin, Reception, Doctors, Patients)
            User adminUser = userRepo.save(User.builder()
                    .name("District Hospital Admin")
                    .email("admin@hospital.gov.in")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .phone("9876500000")
                    .build());

            User receptionUser = userRepo.save(User.builder()
                    .name("Reception Desk - Counter 1")
                    .email("reception@hospital.gov.in")
                    .password(passwordEncoder.encode("reception123"))
                    .role(Role.ROLE_RECEPTION)
                    .phone("9876500001")
                    .build());

            User docUser1 = userRepo.save(User.builder()
                    .name("Dr. Rajesh Sharma")
                    .email("dr.sharma@hospital.gov.in")
                    .password(passwordEncoder.encode("doctor123"))
                    .role(Role.ROLE_DOCTOR)
                    .phone("9876500002")
                    .build());

            User docUser2 = userRepo.save(User.builder()
                    .name("Dr. Sneha Patil")
                    .email("dr.patil@hospital.gov.in")
                    .password(passwordEncoder.encode("doctor123"))
                    .role(Role.ROLE_DOCTOR)
                    .phone("9876500003")
                    .build());

            User docUser3 = userRepo.save(User.builder()
                    .name("Dr. Amit Verma")
                    .email("dr.verma@hospital.gov.in")
                    .password(passwordEncoder.encode("doctor123"))
                    .role(Role.ROLE_DOCTOR)
                    .phone("9876500004")
                    .build());

            User patientUser1 = userRepo.save(User.builder()
                    .name("Ramesh Kulkarni")
                    .email("ramesh@gmail.com")
                    .password(passwordEncoder.encode("patient123"))
                    .role(Role.ROLE_PATIENT)
                    .phone("9822011223")
                    .build());

            // 2. Create Doctors
            Doctor doc1 = doctorRepo.save(Doctor.builder()
                    .name("Dr. Rajesh Sharma (MD)")
                    .department("General Medicine (सामान्य ओपीडी)")
                    .roomNo("Room 101")
                    .avgConsultMinutes(8)
                    .isAvailable(true)
                    .user(docUser1)
                    .build());

            Doctor doc2 = doctorRepo.save(Doctor.builder()
                    .name("Dr. Sneha Patil (MS, Gynae)")
                    .department("Gynecology & Obstetrics (स्त्रीरोग विभाग)")
                    .roomNo("Room 204")
                    .avgConsultMinutes(10)
                    .isAvailable(true)
                    .user(docUser2)
                    .build());

            Doctor doc3 = doctorRepo.save(Doctor.builder()
                    .name("Dr. Amit Verma (MD, Peds)")
                    .department("Pediatrics (बालरोग विभाग)")
                    .roomNo("Room 105")
                    .avgConsultMinutes(6)
                    .isAvailable(true)
                    .user(docUser3)
                    .build());

            // 3. Create Sample Patients
            Patient p1 = patientRepo.save(Patient.builder()
                    .name("Ramesh Kulkarni")
                    .phone("9822011223")
                    .age(68)
                    .gender("Male")
                    .address("Shivaji Nagar, Pune")
                    .isSeniorCitizen(true)
                    .isPregnant(false)
                    .user(patientUser1)
                    .build());

            Patient p2 = patientRepo.save(Patient.builder()
                    .name("Pooja Deshmukh")
                    .phone("9822044556")
                    .age(27)
                    .gender("Female")
                    .address("Kothrud, Pune")
                    .isSeniorCitizen(false)
                    .isPregnant(true)
                    .build());

            Patient p3 = patientRepo.save(Patient.builder()
                    .name("Ajay Jadhav")
                    .phone("9822077889")
                    .age(42)
                    .gender("Male")
                    .address("Hadapsar, Pune")
                    .isSeniorCitizen(false)
                    .isPregnant(false)
                    .build());

            Patient p4 = patientRepo.save(Patient.builder()
                    .name("Sunita Gaikwad (Emergency)")
                    .phone("9822099001")
                    .age(55)
                    .gender("Female")
                    .address("Swargate, Pune")
                    .isSeniorCitizen(false)
                    .isPregnant(false)
                    .build());

            // 4. Create Sample Tokens in Queue
            tokenRepo.save(Token.builder()
                    .tokenNo("EMG-001")
                    .patient(p4)
                    .doctor(doc1)
                    .priority(Priority.EMERGENCY)
                    .status(TokenStatus.WAITING)
                    .estimatedWaitMinutes(8)
                    .isWalkIn(true)
                    .createdAt(LocalDateTime.now().minusMinutes(15))
                    .build());

            tokenRepo.save(Token.builder()
                    .tokenNo("D1-002")
                    .patient(p1)
                    .doctor(doc1)
                    .priority(Priority.SENIOR_OR_PREGNANT)
                    .status(TokenStatus.WAITING)
                    .estimatedWaitMinutes(16)
                    .isWalkIn(true)
                    .createdAt(LocalDateTime.now().minusMinutes(25))
                    .build());

            tokenRepo.save(Token.builder()
                    .tokenNo("D1-003")
                    .patient(p3)
                    .doctor(doc1)
                    .priority(Priority.NORMAL)
                    .status(TokenStatus.WAITING)
                    .estimatedWaitMinutes(24)
                    .isWalkIn(true)
                    .createdAt(LocalDateTime.now().minusMinutes(20))
                    .build());

            tokenRepo.save(Token.builder()
                    .tokenNo("D2-001")
                    .patient(p2)
                    .doctor(doc2)
                    .priority(Priority.SENIOR_OR_PREGNANT)
                    .status(TokenStatus.CALLED)
                    .estimatedWaitMinutes(0)
                    .calledAt(LocalDateTime.now().minusMinutes(3))
                    .isWalkIn(true)
                    .createdAt(LocalDateTime.now().minusMinutes(30))
                    .build());

            // 5. Sample Past Visit
            visitRepo.save(Visit.builder()
                    .patient(p1)
                    .doctor(doc1)
                    .diagnosisNotes("Chronic Hypertension checkup. Blood pressure slightly elevated.")
                    .prescription("Tab Telmisartan 40mg (1-0-0) x 30 days\nTab Amlodipine 5mg (0-0-1)")
                    .vitals("BP: 145/90 mmHg, Pulse: 78 bpm, Weight: 72kg")
                    .followUpDate("2026-11-08")
                    .visitDate(LocalDateTime.now().minusDays(15))
                    .build());

            System.out.println(">>> Sample Hospital Queue Data Initialized Successfully! <<<");
        };
    }
}
