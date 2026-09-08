package com.theweplm.signforge.Middlewares;

import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Models.Classes.ApiResponseClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Global Exception Handler Middleware (1:1 AssetSphere Middleware pattern).
 * Intercepts all validation and runtime exceptions and formats into standard ApiResponseClass envelopes.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandlerMiddleware {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseClass<Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(fieldError.getField() + ": " + fieldError.getDefaultMessage());
        }

        String primaryMessage = !errors.isEmpty() ? errors.get(0) : "Validation failed.";
        log.warn("Jakarta Bean validation failure: {}", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseClass.failed(primaryMessage, errors, 400));
    }

    @ExceptionHandler(ValidationCException.class)
    public ResponseEntity<ApiResponseClass<Object>> handleValidationCException(ValidationCException ex) {
        log.warn("Custom validation failure: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseClass.failed(ex.getMessage(), ex.getValidationErrors(), 400));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Object>> handleGenericException(Exception ex) {
        log.error("Unhandled server exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.failed("An unexpected internal server error occurred.",
                        Collections.singletonList(ex.getMessage()), 500));
    }
}
