package com.theweplm.signforge.Features.HealthCheck;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.HealthCheck.Models.HealthCheckResponseDTO;
import com.theweplm.signforge.Features.HealthCheck.Models.HealthStatusType;
import com.theweplm.signforge.Features.HealthCheck.Services.IHealthCheckService;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.HealthCheckRoutes.CONTROLLER_URL)
public final class HealthCheckController {

    private final IHealthCheckService healthCheckService;

    @GetMapping(ApplicationRouteFactory.HealthCheckRoutes.STATUS)
    public ResponseEntity<ApiResponseClass<HealthCheckResponseDTO>> getStatus() {
        try {
            HealthCheckResponseDTO report = healthCheckService.checkHealth();

            int statusCode = HealthStatusType.HEALTHY.equals(report.getOverallStatus())
                    ? 200
                    : (HealthStatusType.DEGRADED.equals(report.getOverallStatus()) ? 200 : 503);

            String message = HealthStatusType.HEALTHY.equals(report.getOverallStatus())
                    ? "All systems operational and healthy."
                    : (HealthStatusType.DEGRADED.equals(report.getOverallStatus())
                    ? "Systems operational with degraded performance."
                    : "One or more critical subsystems are unhealthy.");

            return ResponseEntity.status(statusCode)
                    .body(ApiResponseClass.succeeded(report, message, statusCode));
        } catch (ValidationCException valEx) {
            log.warn("Health check validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error executing health check diagnostics", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred during health check diagnosis.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.HealthCheckRoutes.PING)
    public ResponseEntity<ApiResponseClass<Map<String, Object>>> ping() {
        Map<String, Object> pingData = Map.of(
                "status", "PONG",
                "timestamp", Instant.now().toString()
        );
        return ResponseEntity.ok(ApiResponseClass.succeeded(pingData, "Liveness probe succeeded.", 200));
    }
}
