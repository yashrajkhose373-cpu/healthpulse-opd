package gov.hospital.smartqueue.dto;

import gov.hospital.smartqueue.model.Token;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorQueueStateDTO {
    private Long doctorId;
    private String doctorName;
    private String department;
    private String roomNo;
    private Integer avgConsultMinutes;
    private TokenResponseDTO currentlyCalled;
    private List<TokenResponseDTO> waitingQueue;
    private int totalWaiting;
    private int totalCompletedToday;
}
