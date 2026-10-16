package gov.hospital.smartqueue.repository;

import gov.hospital.smartqueue.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPhone(String phone);
    Optional<Patient> findByUserId(Long userId);
    
    @Query("SELECT p FROM Patient p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR p.phone LIKE CONCAT('%', :query, '%')")
    List<Patient> searchByNameOrPhone(@Param("query") String query);
}
