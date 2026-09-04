package com.theweplm.signforge.Features.Authentication.Models;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RefreshTokenRequestDTO {

    @NotBlank(message = "RefreshToken property cannot be null or empty.")
    private String refreshToken;
}
