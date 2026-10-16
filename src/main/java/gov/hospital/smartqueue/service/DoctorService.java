package gov.hospital.smartqueue.service;

import gov.hospital.smartqueue.model.Doctor;
import gov.hospital.smartqueue.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByIsAvailableTrue();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }

    public Doctor toggleAvailability(Long doctorId) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));
        doc.setIsAvailable(!doc.getIsAvailable());
        return doctorRepository.save(doc);
    }
}
