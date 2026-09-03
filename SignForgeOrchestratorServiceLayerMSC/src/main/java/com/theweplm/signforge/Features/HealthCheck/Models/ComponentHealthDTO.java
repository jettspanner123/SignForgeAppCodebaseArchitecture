package com.theweplm.signforge.Features.HealthCheck.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ComponentHealthDTO {

    @Builder.Default
    private String componentName = "";

    @Builder.Default
    private String status = HealthStatusType.HEALTHY;

    private long latencyMs;
    private String details;

    @Builder.Default
    private Instant checkedAt = Instant.now();
}
