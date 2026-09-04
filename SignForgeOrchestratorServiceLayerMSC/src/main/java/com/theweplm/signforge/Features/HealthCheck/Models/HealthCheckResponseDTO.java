package com.theweplm.signforge.Features.HealthCheck.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class HealthCheckResponseDTO {

    @Builder.Default
    private String overallStatus = HealthStatusType.HEALTHY;

    private long totalDurationMs;

    @Builder.Default
    private ComponentHealthDTO database = new ComponentHealthDTO();

    @Builder.Default
    private RuntimeHealthDTO runtime = new RuntimeHealthDTO();

    @Builder.Default
    private List<ComponentHealthDTO> subsystems = new ArrayList<>();

    @Builder.Default
    private Instant timestamp = Instant.now();
}
