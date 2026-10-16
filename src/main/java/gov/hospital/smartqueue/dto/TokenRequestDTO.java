package gov.hospital.smartqueue.dto;

import gov.hospital.smartqueue.model.Priority;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRequestDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long appointmentId;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @Builder.Default
    private Boolean isWalkIn = true;
}
