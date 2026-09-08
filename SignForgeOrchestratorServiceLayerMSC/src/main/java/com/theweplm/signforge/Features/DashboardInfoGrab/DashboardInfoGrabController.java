package com.theweplm.signforge.Features.DashboardInfoGrab;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.DashboardInfoGrab.Assertion.DashboardInfoGrabAssertion;
import com.theweplm.signforge.Features.DashboardInfoGrab.Models.DashboardInfoGrabResponseDTO;
import com.theweplm.signforge.Features.DashboardInfoGrab.Services.IDashboardInfoGrabService;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.DashboardInfoGrabRoutes.CONTROLLER_URL)
public final class DashboardInfoGrabController {

    private final IDashboardInfoGrabService dashboardInfoGrabService;

    @GetMapping(ApplicationRouteFactory.DashboardInfoGrabRoutes.GET_DASHBOARD_DATA)
    public ResponseEntity<ApiResponseClass<DashboardInfoGrabResponseDTO>> getDashboardData(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            UUID userId = null;
            String userRole = "HR_MANAGER";

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                Map<String, Object> claims = JwtTokenHelper.getCurrent().validateAndExtractClaims(authHeader);
                if (claims != null && claims.get("sub") != null) {
                    try {
                        userId = DashboardInfoGrabAssertion.getCurrent().assertValidUserId(claims.get("sub").toString());
                        userRole = claims.get("role") != null ? claims.get("role").toString() : userRole;
                    } catch (Exception ignored) {}
                }
            }

            DashboardInfoGrabResponseDTO response = dashboardInfoGrabService.getDashboardData(userId, userRole);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Dashboard information retrieved successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Dashboard info grab validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while fetching dashboard info data", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while fetching dashboard information.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }
}
