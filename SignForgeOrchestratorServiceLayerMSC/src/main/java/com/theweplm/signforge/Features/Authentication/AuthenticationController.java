package com.theweplm.signforge.Features.Authentication;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Factories.ApplicationRouteFactory;
import com.theweplm.signforge.Features.Authentication.Assertion.AuthenticationAssertion;
import com.theweplm.signforge.Features.Authentication.Models.AuthResponseDTO;
import com.theweplm.signforge.Features.Authentication.Models.LoginRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.RefreshTokenRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.UserProfileDTO;
import com.theweplm.signforge.Features.Authentication.Services.IAuthenticationService;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApplicationRouteFactory.AuthenticationRoutes.CONTROLLER_URL)
public final class AuthenticationController {

    private final IAuthenticationService authenticationService;

    @PostMapping(ApplicationRouteFactory.AuthenticationRoutes.LOGIN)
    public ResponseEntity<ApiResponseClass<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            AuthenticationAssertion.getCurrent().checkForNullRequest(request);
            AuthenticationAssertion.getCurrent().assertLoginRequest(request);

            AuthResponseDTO response = authenticationService.login(request);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Login successful.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Login validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred during login for email: {}", request != null ? request.getEmail() : "null", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while processing the login request.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @PostMapping(ApplicationRouteFactory.AuthenticationRoutes.REFRESH_TOKEN)
    public ResponseEntity<ApiResponseClass<AuthResponseDTO>> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        try {
            AuthenticationAssertion.getCurrent().checkForNullRequest(request);
            AuthenticationAssertion.getCurrent().assertRefreshTokenRequest(request);

            AuthResponseDTO response = authenticationService.refreshToken(request);
            return ResponseEntity.ok(ApiResponseClass.succeeded(response, "Token refreshed successfully.", 200));
        } catch (ValidationCException valEx) {
            log.warn("Token refresh validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while refreshing token", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while refreshing token.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }

    @GetMapping(ApplicationRouteFactory.AuthenticationRoutes.ME)
    public ResponseEntity<ApiResponseClass<UserProfileDTO>> getCurrentUser(
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

            UUID userId = AuthenticationAssertion.getCurrent().assertValidUserId(claims.get("sub").toString());
            UserProfileDTO profile = authenticationService.getCurrentUser(userId);
            return ResponseEntity.ok(ApiResponseClass.succeeded(profile, "User profile retrieved.", 200));
        } catch (ValidationCException valEx) {
            log.warn("User profile retrieval validation warning: {}", valEx.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.failed(valEx.getMessage(), valEx.getValidationErrors(), 400));
        } catch (Exception ex) {
            log.error("Unexpected error occurred while retrieving user profile", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.failed("An unexpected error occurred while retrieving current user profile.",
                            Collections.singletonList(ex.getMessage()), 500));
        }
    }
}
