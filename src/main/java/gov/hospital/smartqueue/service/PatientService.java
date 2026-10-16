package gov.hospital.smartqueue.service;

import gov.hospital.smartqueue.model.Patient;
import gov.hospital.smartqueue.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient registerPatient(Patient patient) {
        if (patient.getAge() != null && patient.getAge() >= 60) {
            patient.setIsSeniorCitizen(true);
        }
        return patientRepository.save(patient);
    }

    public Optional<Patient> findByPhone(String phone) {
        return patientRepository.findByPhone(phone);
    }

    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }

    public List<Patient> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return patientRepository.findAll();
        }
        return patientRepository.searchByNameOrPhone(query.trim());
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }
}
