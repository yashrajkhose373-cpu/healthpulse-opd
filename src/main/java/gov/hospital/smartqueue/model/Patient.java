package gov.hospital.smartqueue.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 10)
    private String gender; // Male, Female, Other

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "senior_citizen")
    private Boolean isSeniorCitizen;

    @Column(name = "pregnant")
    private Boolean isPregnant;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Visit> visits = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (age != null && age >= 60) {
            this.isSeniorCitizen = true;
        }
    }
}
