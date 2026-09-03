package com.theweplm.signforge.Features.HealthCheck.Models;

public class RuntimeHealthDTO {
    private String environmentName = "Development";
    private String uptime = "";
    private double memoryAllocatedMB;
    private int threadCount;
    private String runtimeVersion = "";

    public RuntimeHealthDTO() {}

    public String getEnvironmentName() { return environmentName; }
    public void setEnvironmentName(String environmentName) { this.environmentName = environmentName; }

    public String getUptime() { return uptime; }
    public void setUptime(String uptime) { this.uptime = uptime; }

    public double getMemoryAllocatedMB() { return memoryAllocatedMB; }
    public void setMemoryAllocatedMB(double memoryAllocatedMB) { this.memoryAllocatedMB = memoryAllocatedMB; }

    public int getThreadCount() { return threadCount; }
    public void setThreadCount(int threadCount) { this.threadCount = threadCount; }

    public String getRuntimeVersion() { return runtimeVersion; }
    public void setRuntimeVersion(String runtimeVersion) { this.runtimeVersion = runtimeVersion; }
}
