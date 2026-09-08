package com.theweplm.signforge.Features.DashboardInfoGrab.Assertion;

import com.theweplm.signforge.Exceptions.ValidationCException;

import java.util.UUID;

/**
 * Feature Assertion Singleton for Dashboard Info Grab.
 */
public final class DashboardInfoGrabAssertion {

    private static final DashboardInfoGrabAssertion CURRENT = new DashboardInfoGrabAssertion();

    public static DashboardInfoGrabAssertion getCurrent() {
        return CURRENT;
    }

    private DashboardInfoGrabAssertion() {}

    public UUID assertValidUserId(String userIdClaim) {
        if (userIdClaim == null || userIdClaim.trim().isEmpty()) {
            throw new ValidationCException("Missing or empty user identity claim in security token.");
        }
        try {
            return UUID.fromString(userIdClaim.trim());
        } catch (IllegalArgumentException ex) {
            throw new ValidationCException("User identity claim is not a valid UUID format.");
        }
    }
}
