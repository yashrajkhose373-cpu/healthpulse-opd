package gov.hospital.smartqueue.repository;

import gov.hospital.smartqueue.model.Token;
import gov.hospital.smartqueue.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    // Fetch active queue for a doctor sorted by Priority Rank ascending, then CreatedAt ascending
    @Query("SELECT t FROM Token t WHERE t.doctor.id = :doctorId AND t.status = 'WAITING' ORDER BY CASE t.priority WHEN gov.hospital.smartqueue.model.Priority.EMERGENCY THEN 1 WHEN gov.hospital.smartqueue.model.Priority.SENIOR_OR_PREGNANT THEN 2 ELSE 3 END ASC, t.createdAt ASC")
    List<Token> findWaitingQueueByDoctor(@Param("doctorId") Long doctorId);

    // Fetch all active tokens for a doctor (WAITING, CALLED, IN_CONSULTATION)
    @Query("SELECT t FROM Token t WHERE t.doctor.id = :doctorId AND t.status IN ('WAITING', 'CALLED', 'IN_CONSULTATION') ORDER BY CASE t.status WHEN gov.hospital.smartqueue.model.TokenStatus.CALLED THEN 1 WHEN gov.hospital.smartqueue.model.TokenStatus.IN_CONSULTATION THEN 2 ELSE 3 END ASC, CASE t.priority WHEN gov.hospital.smartqueue.model.Priority.EMERGENCY THEN 1 WHEN gov.hospital.smartqueue.model.Priority.SENIOR_OR_PREGNANT THEN 2 ELSE 3 END ASC, t.createdAt ASC")
    List<Token> findActiveTokensByDoctor(@Param("doctorId") Long doctorId);

    // Fetch today's tokens for a doctor
    @Query("SELECT t FROM Token t WHERE t.doctor.id = :doctorId AND t.createdAt >= :startOfDay AND t.createdAt <= :endOfDay ORDER BY t.createdAt DESC")
    List<Token> findTodayTokensByDoctor(@Param("doctorId") Long doctorId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    // Find currently called token for a doctor
    Optional<Token> findFirstByDoctorIdAndStatusOrderByCalledAtDesc(Long doctorId, TokenStatus status);

    // No-show tokens
    List<Token> findByStatusAndCreatedAtBetween(TokenStatus status, LocalDateTime startOfDay, LocalDateTime endOfDay);

    // Count tokens by date range and status
    long countByCreatedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
    long countByStatusAndCreatedAtBetween(TokenStatus status, LocalDateTime startOfDay, LocalDateTime endOfDay);

    // Doctor specific counts
    long countByDoctorIdAndCreatedAtBetween(Long doctorId, LocalDateTime startOfDay, LocalDateTime endOfDay);
    long countByDoctorIdAndStatusAndCreatedAtBetween(Long doctorId, TokenStatus status, LocalDateTime startOfDay, LocalDateTime endOfDay);

    // Count today's tokens for sequential token numbering
    long countByCreatedAtGreaterThanEqual(LocalDateTime startOfDay);
}
