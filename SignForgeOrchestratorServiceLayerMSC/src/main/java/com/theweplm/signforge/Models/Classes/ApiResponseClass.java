package com.theweplm.signforge.Models.Classes;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Collections;
import java.util.List;

/**
 * Standard structured API Response envelope.
 *
 * @param <T> Payload data type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class ApiResponseClass<T> {

    private T data;
    private boolean success;
    private String message;
    private List<String> errors;
    private int statusCode;

    public ApiResponseClass() {
    }

    public ApiResponseClass(T data, boolean success, String message, List<String> errors, int statusCode) {
        this.data = data;
        this.success = success;
        this.message = message;
        this.errors = errors;
        this.statusCode = statusCode;
    }

    public static <T> ApiResponseClass<T> succeeded(T data, String message, int statusCode) {
        return new ApiResponseClass<>(data, true, message, null, statusCode);
    }

    public static <T> ApiResponseClass<T> succeeded(T data, String message) {
        return succeeded(data, message, 200);
    }

    public static <T> ApiResponseClass<T> succeeded(T data) {
        return succeeded(data, "Operation completed successfully.", 200);
    }

    public static <T> ApiResponseClass<T> failed(String message, List<String> errors, int statusCode) {
        return new ApiResponseClass<>(null, false, message, errors != null ? errors : Collections.singletonList(message), statusCode);
    }

    public static <T> ApiResponseClass<T> failed(String message, int statusCode) {
        return failed(message, Collections.singletonList(message), statusCode);
    }

    public static <T> ApiResponseClass<T> failed(String message) {
        return failed(message, Collections.singletonList(message), 400);
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }
}
