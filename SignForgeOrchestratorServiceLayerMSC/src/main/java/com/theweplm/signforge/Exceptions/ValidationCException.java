package com.theweplm.signforge.Exceptions;

import java.util.Collections;
import java.util.List;

/**
 * Custom validation exception thrown when request assertion fails.
 */
public final class ValidationCException extends RuntimeException {

    private final List<String> validationErrors;

    public ValidationCException(String message) {
        super(message);
        this.validationErrors = Collections.singletonList(message);
    }

    public ValidationCException(List<String> validationErrors) {
        super("One or more validation failures occurred.");
        this.validationErrors = validationErrors != null ? validationErrors : Collections.emptyList();
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
