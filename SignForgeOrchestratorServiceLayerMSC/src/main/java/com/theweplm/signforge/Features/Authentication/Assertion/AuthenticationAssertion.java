package com.theweplm.signforge.Features.Authentication.Assertion;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.Authentication.Models.LoginRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.RefreshTokenRequestDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Feature Assertion Singleton for Authentication Request Validations.
 */
public final class AuthenticationAssertion {

    private static final AuthenticationAssertion CURRENT = new AuthenticationAssertion();

    public static AuthenticationAssertion getCurrent() {
        return CURRENT;
    }

    private AuthenticationAssertion() {}

    public <T> void checkForNullRequest(T request, String errorMessage) {
        if (request == null) {
            throw new ValidationCException(errorMessage != null ? errorMessage : "Request body cannot be empty.");
        }
    }

    public <T> void checkForNullRequest(T request) {
        checkForNullRequest(request, "Request body cannot be empty.");
    }

    public void assertLoginRequest(LoginRequestDTO request) {
        checkForNullRequest(request, "Login request body cannot be empty.");

        List<String> missingFields = new ArrayList<>();
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            missingFields.add("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            missingFields.add("Password is required.");
        }

        if (!missingFields.isEmpty()) {
            throw new ValidationCException(missingFields);
        }
    }

    public void assertRefreshTokenRequest(RefreshTokenRequestDTO request) {
        checkForNullRequest(request, "Refresh token request body cannot be empty.");

        if (request.getRefreshToken() == null || request.getRefreshToken().trim().isEmpty()) {
            throw new ValidationCException(List.of("RefreshToken property cannot be null or empty."));
        }
    }

    public UUID assertValidUserId(String userIdClaim) {
        if (userIdClaim == null || userIdClaim.trim().isEmpty()) {
            throw new ValidationCException("Invalid or missing user identity in security token.");
        }
        try {
            return UUID.fromString(userIdClaim.trim());
        } catch (IllegalArgumentException ex) {
            throw new ValidationCException("User identity in security token is not a valid UUID.");
        }
    }
}
