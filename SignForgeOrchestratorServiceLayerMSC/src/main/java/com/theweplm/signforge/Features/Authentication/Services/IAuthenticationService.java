package com.theweplm.signforge.Features.Authentication.Services;

import com.theweplm.signforge.Features.Authentication.Models.AuthResponseDTO;
import com.theweplm.signforge.Features.Authentication.Models.LoginRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.RefreshTokenRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.UserProfileDTO;

import java.util.UUID;

public interface IAuthenticationService {
    AuthResponseDTO login(LoginRequestDTO request);
    AuthResponseDTO refreshToken(RefreshTokenRequestDTO request);
    UserProfileDTO getCurrentUser(UUID userId);
}
