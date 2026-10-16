package gov.hospital.smartqueue.controller;

import gov.hospital.smartqueue.dto.DashboardStatsDTO;
import gov.hospital.smartqueue.dto.DoctorQueueStateDTO;
import gov.hospital.smartqueue.dto.TokenRequestDTO;
import gov.hospital.smartqueue.dto.TokenResponseDTO;
import gov.hospital.smartqueue.model.Patient;
import gov.hospital.smartqueue.service.DoctorService;
import gov.hospital.smartqueue.service.PatientService;
import gov.hospital.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class QueueApiController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    // 1. Generate Token (Walk-in or Online)
    @PostMapping("/tokens")
    public ResponseEntity<?> generateToken(@Valid @RequestBody TokenRequestDTO request) {
        TokenResponseDTO response = queueService.generateToken(request);
        return ResponseEntity.ok(response);
    }

    // 2. Get Live Queue for specific Doctor
    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<DoctorQueueStateDTO> getDoctorQueue(@PathVariable Long doctorId) {
        DoctorQueueStateDTO state = queueService.getLiveQueueForDoctor(doctorId);
        return ResponseEntity.ok(state);
    }

    // 3. Call Next Token for a Doctor
    @PutMapping("/tokens/doctor/{doctorId}/call-next")
    public ResponseEntity<?> callNextToken(@PathVariable Long doctorId) {
        TokenResponseDTO next = queueService.callNextToken(doctorId);
        if (next == null) {
            return ResponseEntity.ok(Map.of("message", "No more patients waiting in queue"));
        }
        return ResponseEntity.ok(next);
    }

    // 4. Complete consultation and save notes
    @PutMapping("/tokens/{id}/complete")
    public ResponseEntity<?> completeToken(
            @PathVariable Long id,
            @RequestParam Long doctorId,
            @RequestParam(required = false, defaultValue = "") String diagnosis,
            @RequestParam(required = false, defaultValue = "") String prescription,
            @RequestParam(required = false, defaultValue = "") String vitals,
            @RequestParam(required = false, defaultValue = "") String followUpDate) {
        TokenResponseDTO completed = queueService.completeCurrentToken(doctorId, id, diagnosis, prescription, vitals, followUpDate);
        return ResponseEntity.ok(completed);
    }

    // 5. Mark Patient as No-Show
    @PutMapping("/tokens/{id}/no-show")
    public ResponseEntity<?> markNoShow(@PathVariable Long id) {
        TokenResponseDTO noShow = queueService.markNoShow(id);
        return ResponseEntity.ok(noShow);
    }

    // 6. Move No-Show to the End of the queue
    @PutMapping("/tokens/{id}/retry")
    public ResponseEntity<?> moveNoShowToEnd(@PathVariable Long id) {
        TokenResponseDTO moved = queueService.moveNoShowToEnd(id);
        return ResponseEntity.ok(moved);
    }

    // 7. Get No-Shows for today
    @GetMapping("/tokens/no-shows")
    public ResponseEntity<List<TokenResponseDTO>> getNoShows() {
        return ResponseEntity.ok(queueService.getTodayNoShows());
    }

    // 8. Patient search API
    @GetMapping("/patients/search")
    public ResponseEntity<List<Patient>> searchPatients(@RequestParam(required = false, defaultValue = "") String phone) {
        return ResponseEntity.ok(patientService.search(phone));
    }

    // 9. Hospital Dashboard stats
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(queueService.getDashboardStats());
    }
}
