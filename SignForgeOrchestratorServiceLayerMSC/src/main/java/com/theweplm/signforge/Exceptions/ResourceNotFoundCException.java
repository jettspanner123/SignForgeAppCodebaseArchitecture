package com.theweplm.signforge.Exceptions;

import java.util.Collections;
import java.util.List;

/**
 * Custom exception thrown when a requested resource is not found.
 */
public final class ResourceNotFoundCException extends RuntimeException {

    private final List<String> validationErrors;

    public ResourceNotFoundCException(String message) {
        super(message);
        this.validationErrors = Collections.singletonList(message);
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
