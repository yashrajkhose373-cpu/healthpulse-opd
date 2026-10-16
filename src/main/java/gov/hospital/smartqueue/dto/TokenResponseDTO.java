package gov.hospital.smartqueue.dto;

import gov.hospital.smartqueue.model.Priority;
import gov.hospital.smartqueue.model.TokenStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponseDTO {
    private Long id;
    private String tokenNo;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Integer patientAge;
    private String patientGender;
    private Long doctorId;
    private String doctorName;
    private String department;
    private String roomNo;
    private Priority priority;
    private String priorityLabel;
    private TokenStatus status;
    private Integer estimatedWaitMinutes;
    private int queuePosition;
    private LocalDateTime createdAt;
    private LocalDateTime calledAt;
}
