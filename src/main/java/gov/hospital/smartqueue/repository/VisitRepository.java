package gov.hospital.smartqueue.repository;

import gov.hospital.smartqueue.model.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByPatientIdOrderByVisitDateDesc(Long patientId);
    List<Visit> findByDoctorIdOrderByVisitDateDesc(Long doctorId);
    long countByVisitDateBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
