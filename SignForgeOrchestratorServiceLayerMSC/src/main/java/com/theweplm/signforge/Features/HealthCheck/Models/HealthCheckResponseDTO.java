package com.theweplm.signforge.Features.HealthCheck.Models;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class HealthCheckResponseDTO {
    private String overallStatus = HealthStatusType.HEALTHY;
    private long totalDurationMs;
    private ComponentHealthDTO database = new ComponentHealthDTO();
    private RuntimeHealthDTO runtime = new RuntimeHealthDTO();
    private List<ComponentHealthDTO> subsystems = new ArrayList<>();
    private Instant timestamp = Instant.now();

    public HealthCheckResponseDTO() {}

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }

    public long getTotalDurationMs() { return totalDurationMs; }
    public void setTotalDurationMs(long totalDurationMs) { this.totalDurationMs = totalDurationMs; }

    public ComponentHealthDTO getDatabase() { return database; }
    public void setDatabase(ComponentHealthDTO database) { this.database = database; }

    public RuntimeHealthDTO getRuntime() { return runtime; }
    public void setRuntime(RuntimeHealthDTO runtime) { this.runtime = runtime; }

    public List<ComponentHealthDTO> getSubsystems() { return subsystems; }
    public void setSubsystems(List<ComponentHealthDTO> subsystems) { this.subsystems = subsystems; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
