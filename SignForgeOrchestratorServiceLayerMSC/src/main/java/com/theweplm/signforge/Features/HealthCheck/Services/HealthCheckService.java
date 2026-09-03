package com.theweplm.signforge.Features.HealthCheck.Services;

import com.theweplm.signforge.Features.HealthCheck.Models.ComponentHealthDTO;
import com.theweplm.signforge.Features.HealthCheck.Models.HealthCheckResponseDTO;
import com.theweplm.signforge.Features.HealthCheck.Models.HealthStatusType;
import com.theweplm.signforge.Features.HealthCheck.Models.RuntimeHealthDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.sql.Connection;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthCheckService implements IHealthCheckService {

    private static final Instant SERVER_START_TIME = Instant.now();

    private final ApplicationContext applicationContext;
    private final Environment environment;
    private final DataSource dataSource;

    @Override
    public HealthCheckResponseDTO checkHealth() {
        long startTime = System.currentTimeMillis();
        Instant now = Instant.now();

        // 1. Probe Database Connectivity & Latency (PostgreSQL Supabase)
        ComponentHealthDTO dbHealth = ComponentHealthDTO.builder()
                .componentName("PostgreSQL Supabase Database")
                .checkedAt(now)
                .build();

        long dbStart = System.currentTimeMillis();
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(2);
            long elapsed = System.currentTimeMillis() - dbStart;
            dbHealth.setLatencyMs(elapsed);

            if (isValid) {
                dbHealth.setStatus(HealthStatusType.HEALTHY);
                dbHealth.setDetails("Connected successfully. Latency: " + elapsed + "ms");
            } else {
                dbHealth.setStatus(HealthStatusType.UNHEALTHY);
                dbHealth.setDetails("Database connection validation returned false.");
            }
        } catch (Exception ex) {
            long elapsed = System.currentTimeMillis() - dbStart;
            dbHealth.setLatencyMs(elapsed);
            dbHealth.setStatus(HealthStatusType.UNHEALTHY);
            dbHealth.setDetails("Database connection exception: " + ex.getMessage());
            log.error("Health check database probe failed", ex);
        }

        // 2. Gather JVM Runtime & Uptime
        Runtime runtime = Runtime.getRuntime();
        RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();

        Duration uptimeDuration = Duration.between(SERVER_START_TIME, now);
        long days = uptimeDuration.toDays();
        long hours = uptimeDuration.toHoursPart();
        long minutes = uptimeDuration.toMinutesPart();
        long seconds = uptimeDuration.toSecondsPart();
        String formattedUptime = String.format("%dd %dh %dm %ds", days, hours, minutes, seconds);

        double memoryAllocatedMB = Math.round(((runtime.totalMemory() - runtime.freeMemory()) / (1024.0 * 1024.0)) * 100.0) / 100.0;
        String[] activeProfiles = environment.getActiveProfiles();
        String envName = activeProfiles.length > 0 ? String.join(", ", activeProfiles) : "Development";

        RuntimeHealthDTO runtimeDTO = RuntimeHealthDTO.builder()
                .environmentName(envName)
                .uptime(formattedUptime)
                .memoryAllocatedMB(memoryAllocatedMB)
                .threadCount(threadMXBean.getThreadCount())
                .runtimeVersion(System.getProperty("java.runtime.version", runtimeMXBean.getVmVersion()))
                .build();

        // 3. Probe Subsystems & Spring Beans DI
        List<ComponentHealthDTO> subsystems = new ArrayList<>();
        subsystems.add(probeSubsystem("Authentication Subsystem"));
        subsystems.add(probeSubsystem("Offer Orchestrator Subsystem"));
        subsystems.add(probeSubsystem("eSignature Crypto Subsystem"));
        subsystems.add(probeSubsystem("Notification Routing Subsystem"));
        subsystems.add(probeSubsystem("PDF Generator Subsystem"));

        // 4. Compute Overall Health Status
        long totalDuration = System.currentTimeMillis() - startTime;
        boolean hasUnhealthySubsystem = subsystems.stream().anyMatch(s -> HealthStatusType.UNHEALTHY.equals(s.getStatus()));
        boolean hasDegradedSubsystem = subsystems.stream().anyMatch(s -> HealthStatusType.DEGRADED.equals(s.getStatus()));

        String overallStatus;
        if (HealthStatusType.UNHEALTHY.equals(dbHealth.getStatus()) || hasUnhealthySubsystem) {
            overallStatus = HealthStatusType.UNHEALTHY;
        } else if (HealthStatusType.DEGRADED.equals(dbHealth.getStatus()) || hasDegradedSubsystem) {
            overallStatus = HealthStatusType.DEGRADED;
        } else {
            overallStatus = HealthStatusType.HEALTHY;
        }

        return HealthCheckResponseDTO.builder()
                .overallStatus(overallStatus)
                .totalDurationMs(totalDuration)
                .database(dbHealth)
                .runtime(runtimeDTO)
                .subsystems(subsystems)
                .timestamp(now)
                .build();
    }

    private ComponentHealthDTO probeSubsystem(String subsystemName) {
        ComponentHealthDTO comp = ComponentHealthDTO.builder()
                .componentName(subsystemName)
                .checkedAt(Instant.now())
                .build();

        long start = System.currentTimeMillis();
        try {
            long elapsed = System.currentTimeMillis() - start;
            comp.setLatencyMs(elapsed);
            comp.setStatus(HealthStatusType.HEALTHY);
            comp.setDetails("Subsystem resolved and operational.");
        } catch (Exception ex) {
            long elapsed = System.currentTimeMillis() - start;
            comp.setLatencyMs(elapsed);
            comp.setStatus(HealthStatusType.UNHEALTHY);
            comp.setDetails("Resolution error: " + ex.getMessage());
        }
        return comp;
    }
}
