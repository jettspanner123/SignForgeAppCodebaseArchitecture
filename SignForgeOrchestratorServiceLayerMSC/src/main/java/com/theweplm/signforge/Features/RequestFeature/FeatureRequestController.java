package com.theweplm.signforge.Features.RequestFeature;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.Authentication.Assertion.AuthenticationAssertion;
import com.theweplm.signforge.Features.RequestFeature.Models.CreateFeatureRequestRequestDTO;
import com.theweplm.signforge.Features.RequestFeature.Models.FeatureRequestDTO;
import com.theweplm.signforge.Features.RequestFeature.Services.IFeatureRequestService;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.RequestFeatureRoutes.CONTROLLER_URL)
public final class FeatureRequestController {

    private final IFeatureRequestService featureRequestService;

    @PostMapping(ApplicationRouteFactory.RequestFeatureRoutes.CREATE)
    public ResponseEntity<ApiResponseClass<FeatureRequestDTO>> createFeatureRequest(
            @Valid @RequestBody CreateFeatureRequestRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.failed("Authorization header with Bearer token is required.", 401));
            }

            Map<String, Object> claims = JwtTokenHelper.getCurrent().validateAndExtractClaims(authHeader);
            if (claims == null || claims.get("sub") == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.failed("Invalid or expired security token.", 401));
            }

            UUID requesterUserId = AuthenticationAssertion.getCurrent().assertValidUserId(claims.get("sub").toString());
            String requesterEmail = claims.get("email") != null ? claims.get("email").toString() : null;

            FeatureRequestDTO created = featureRequestService.createFeatureRequest(request, requesterUserId, requesterEmail);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.succeeded(created, "Feature request submitted successfully.", 201));
        } catch (ValidationCException valEx) {
            log.warn("Feature request validation error: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error submitting feature request", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while submitting feature request.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.RequestFeatureRoutes.GET_ALL)
    public ResponseEntity<ApiResponseClass<List<FeatureRequestDTO>>> getAllFeatureRequests() {
        try {
            List<FeatureRequestDTO> requests = featureRequestService.getAllFeatureRequests();
            return ResponseEntity.ok(ApiResponseClass.succeeded(requests, "Feature requests retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Unexpected error retrieving feature requests", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve feature requests.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.RequestFeatureRoutes.GET_BY_ID)
    public ResponseEntity<ApiResponseClass<FeatureRequestDTO>> getFeatureRequestById(@PathVariable("id") UUID id) {
        try {
            FeatureRequestDTO request = featureRequestService.getFeatureRequestById(id);
            return ResponseEntity.ok(ApiResponseClass.succeeded(request, "Feature request retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Unexpected error retrieving feature request by ID: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("Failed to retrieve feature request.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }
}
