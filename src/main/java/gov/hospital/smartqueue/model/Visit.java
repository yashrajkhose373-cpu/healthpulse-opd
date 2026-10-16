package gov.hospital.smartqueue.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "token_id")
    private Token token;

    @Column(name = "diagnosis_notes", columnDefinition = "TEXT")
    private String diagnosisNotes;

    @Column(name = "prescription", columnDefinition = "TEXT")
    private String prescription;

    @Column(name = "vitals")
    private String vitals; // e.g. "BP: 120/80, Pulse: 72, Temp: 98.6F"

    @Column(name = "follow_up_date")
    private String followUpDate;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @PrePersist
    protected void onCreate() {
        if (this.visitDate == null) {
            this.visitDate = LocalDateTime.now();
        }
    }
}
