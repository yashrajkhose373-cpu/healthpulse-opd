package gov.hospital.smartqueue.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department; // e.g. General Medicine, Pediatrics, Orthopedics, Cardiology, Gynecology

    @Column(name = "room_no", nullable = false)
    private String roomNo;

    @Column(name = "avg_consult_minutes", nullable = false)
    @Builder.Default
    private Integer avgConsultMinutes = 10; // Default 10 minutes per patient

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
