package com.theweplm.signforge.Features.EmploymentOffer;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.EmploymentOffer.Assertion.EmploymentOfferAssertion;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CandidateSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CounterSignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.CreateEmploymentOfferRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.EmploymentOfferResponseDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Models.ThirdPartySignRequestDTO;
import com.theweplm.signforge.Features.EmploymentOffer.Services.IEmploymentOfferService;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping(ApplicationRouteFactory.EmploymentOfferRoutes.CONTROLLER_URL)
public final class EmploymentOfferController {

    private final IEmploymentOfferService employmentOfferService;

    @PostMapping(ApplicationRouteFactory.EmploymentOfferRoutes.CREATE)
    public ResponseEntity<ApiResponseClass<EmploymentOfferResponseDTO>> createEmploymentOffer(
            @Valid @RequestBody CreateEmploymentOfferRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            EmploymentOfferAssertion.getCurrent().checkForNullRequest(request);
            EmploymentOfferAssertion.getCurrent().assertCreateRequest(request);

            UUID userId = null;
            String userName = "Enterprise HR Admin";

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                Map<String, Object> claims = JwtTokenHelper.getCurrent().validateAndExtractClaims(authHeader);
                if (claims != null && claims.get("sub") != null) {
                    try {
                        userId = UUID.fromString(claims.get("sub").toString());
                        userName = claims.get("name") != null ? claims.get("name").toString() : userName;
                    } catch (Exception ignored) {}
                }
            }

            EmploymentOfferResponseDTO response = employmentOfferService.createEmploymentOffer(request, userId, userName);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.succeeded(response, "Employment offer created and persisted successfully.", 201));
        } catch (ValidationCException valEx) {
            log.warn("Create employment offer validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while creating employment offer", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while creating the employment offer.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.EmploymentOfferRoutes.GET_ALL)
    public ResponseEntity<ApiResponseClass<List<EmploymentOfferResponseDTO>>> getAllEmploymentOffers() {
        try {
            List<EmploymentOfferResponseDTO> list = employmentOfferService.getAllEmploymentOffers();
            return ResponseEntity.ok(ApiResponseClass.succeeded(list, "Employment offers retrieved successfully.", 200));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while retrieving employment offers", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while retrieving employment offers.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.EmploymentOfferRoutes.GET_BY_ID)
    public ResponseEntity<ApiResponseClass<EmploymentOfferResponseDTO>> getEmploymentOfferById(@PathVariable("id") String idStr) {
        try {
            UUID offerId = EmploymentOfferAssertion.getCurrent().assertValidUuid(idStr, "Offer ID");
            EmploymentOfferResponseDTO response = employmentOfferService.getEmploymentOfferById(offerId);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Employment offer details retrieved.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Get employment offer validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while retrieving employment offer by ID: {}", idStr, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while retrieving the employment offer.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.EmploymentOfferRoutes.CANDIDATE_SIGN)
    public ResponseEntity<ApiResponseClass<EmploymentOfferResponseDTO>> candidateSign(
            @Valid @RequestBody CandidateSignRequestDTO request) {
        try {
            EmploymentOfferAssertion.getCurrent().checkForNullRequest(request);
            EmploymentOfferAssertion.getCurrent().assertCandidateSignRequest(request);

            EmploymentOfferResponseDTO response = employmentOfferService.candidateSign(request);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Candidate signature recorded successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Candidate signature validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred during candidate signature submission", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred during candidate signature submission.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.EmploymentOfferRoutes.COUNTER_SIGN)
    public ResponseEntity<ApiResponseClass<EmploymentOfferResponseDTO>> counterSign(
            @Valid @RequestBody CounterSignRequestDTO request,
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

            String role = claims.get("role") != null ? claims.get("role").toString() : null;
            EmploymentOfferAssertion.getCurrent().assertRoleAuthorizedForCounterSign(role);

            UUID userId = UUID.fromString(claims.get("sub").toString());
            String userName = claims.get("name") != null ? claims.get("name").toString() : "HR Executive";

            EmploymentOfferAssertion.getCurrent().checkForNullRequest(request);
            EmploymentOfferAssertion.getCurrent().assertCounterSignRequest(request);

            EmploymentOfferResponseDTO response = employmentOfferService.counterSign(request, userId, userName);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "HR Countersignature applied successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Countersign validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred during HR countersignature", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred during HR countersignature.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.EmploymentOfferRoutes.THIRD_PARTY_SIGN)
    public ResponseEntity<ApiResponseClass<EmploymentOfferResponseDTO>> thirdPartySign(
            @Valid @RequestBody ThirdPartySignRequestDTO request,
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

            String role = claims.get("role") != null ? claims.get("role").toString() : null;
            EmploymentOfferAssertion.getCurrent().assertRoleAuthorizedForThirdParty(role);

            UUID userId = UUID.fromString(claims.get("sub").toString());
            String userName = claims.get("name") != null ? claims.get("name").toString() : "Executive Director";

            EmploymentOfferAssertion.getCurrent().checkForNullRequest(request);
            EmploymentOfferAssertion.getCurrent().assertThirdPartySignRequest(request);

            EmploymentOfferResponseDTO response = employmentOfferService.thirdPartySign(request, userId, userName);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Third-party executive signature applied successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Third-party sign validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred during third-party signature", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred during third-party signature.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @DeleteMapping(ApplicationRouteFactory.EmploymentOfferRoutes.DELETE)
    public ResponseEntity<ApiResponseClass<Void>> deleteEmploymentOffer(@PathVariable("id") String idStr) {
        try {
            UUID offerId = EmploymentOfferAssertion.getCurrent().assertValidUuid(idStr, "Offer ID");
            employmentOfferService.deleteEmploymentOffer(offerId);
            return ResponseEntity.ok(ApiResponseClass.succeeded(null, "Employment offer cancelled and archived successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Delete employment offer validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while deleting employment offer", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while cancelling the employment offer.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }
}
