package com.theweplm.signforge.Features.HealthCheck.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RuntimeHealthDTO {

    @Builder.Default
    private String environmentName = "Development";

    @Builder.Default
    private String uptime = "";

    private double memoryAllocatedMB;
    private int threadCount;

    @Builder.Default
    private String runtimeVersion = "";
}
