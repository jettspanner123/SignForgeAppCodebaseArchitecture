package com.theweplm.signforge.Features.HealthCheck.Models;

import java.time.Instant;

public class ComponentHealthDTO {
    private String componentName = "";
    private String status = HealthStatusType.HEALTHY;
    private long latencyMs;
    private String details;
    private Instant checkedAt = Instant.now();

    public ComponentHealthDTO() {}

    public ComponentHealthDTO(String componentName, String status, long latencyMs, String details) {
        this.componentName = componentName;
        this.status = status;
        this.latencyMs = latencyMs;
        this.details = details;
        this.checkedAt = Instant.now();
    }

    public String getComponentName() { return componentName; }
    public void setComponentName(String componentName) { this.componentName = componentName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Instant getCheckedAt() { return checkedAt; }
    public void setCheckedAt(Instant checkedAt) { this.checkedAt = checkedAt; }
}
