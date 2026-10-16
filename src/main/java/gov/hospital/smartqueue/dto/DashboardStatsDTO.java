package gov.hospital.smartqueue.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private LocalDate date;
    private long totalPatientsToday;
    private long totalTokensGeneratedToday;
    private long totalCompletedToday;
    private long totalNoShowsToday;
    private long totalWaitingCurrently;
    private Map<String, Long> tokensPerDepartment;
    private Map<String, Long> tokensPerDoctor;
}
