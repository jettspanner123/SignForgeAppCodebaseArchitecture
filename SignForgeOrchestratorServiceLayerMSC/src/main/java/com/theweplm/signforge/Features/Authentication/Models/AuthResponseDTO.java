package com.theweplm.signforge.Features.Authentication.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AuthResponseDTO {

    private String accessToken;
    private String refreshToken;
    private Instant expiresAt;
    
    @Builder.Default
    private UserProfileDTO user = new UserProfileDTO();
}
