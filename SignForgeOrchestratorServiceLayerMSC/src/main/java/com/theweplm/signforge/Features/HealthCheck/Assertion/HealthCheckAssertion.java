package com.theweplm.signforge.Features.HealthCheck.Assertion;

import com.theweplm.signforge.Exceptions.ValidationCException;

public final class HealthCheckAssertion {

    private static final HealthCheckAssertion CURRENT = new HealthCheckAssertion();

    public static HealthCheckAssertion getCurrent() {
        return CURRENT;
    }

    private HealthCheckAssertion() {
    }

    public <T> void checkForNullRequest(T request, String errorMessage) {
        if (request == null) {
            throw new ValidationCException(errorMessage != null ? errorMessage : "Request cannot be null.");
        }
    }

    public <T> void checkForNullRequest(T request) {
        checkForNullRequest(request, "Request cannot be null.");
    }
}
