package gov.hospital.smartqueue.service;

import gov.hospital.smartqueue.dto.DashboardStatsDTO;
import gov.hospital.smartqueue.dto.DoctorQueueStateDTO;
import gov.hospital.smartqueue.dto.TokenRequestDTO;
import gov.hospital.smartqueue.dto.TokenResponseDTO;
import gov.hospital.smartqueue.model.Doctor;
import gov.hospital.smartqueue.model.Token;
import gov.hospital.smartqueue.model.TokenStatus;
import gov.hospital.smartqueue.model.Visit;

import java.util.List;

public interface QueueService {
    TokenResponseDTO generateToken(TokenRequestDTO requestDTO);
    DoctorQueueStateDTO getLiveQueueForDoctor(Long doctorId);
    TokenResponseDTO callNextToken(Long doctorId);
    TokenResponseDTO completeCurrentToken(Long doctorId, Long tokenId, String diagnosis, String prescription, String vitals, String followUp);
    TokenResponseDTO markNoShow(Long tokenId);
    TokenResponseDTO moveNoShowToEnd(Long tokenId);
    List<TokenResponseDTO> getTodayNoShows();
    DashboardStatsDTO getDashboardStats();
    void broadcastQueueUpdate(Long doctorId);
}
