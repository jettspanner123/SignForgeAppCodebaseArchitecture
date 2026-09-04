package com.theweplm.signforge.Models.Classes;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Collections;
import java.util.List;

/**
 * Standard structured API Response envelope.
 *
 * @param <T> Payload data type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public final class ApiResponseClass<T> {

    private T data;
    private boolean success;
    private String message;
    private List<String> errors;
    private int statusCode;

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
}
