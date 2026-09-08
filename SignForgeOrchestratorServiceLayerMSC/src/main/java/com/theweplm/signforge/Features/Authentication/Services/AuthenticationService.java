package com.theweplm.signforge.Features.Authentication.Services;

import com.theweplm.signforge.Constants.UserRoleType;
import com.theweplm.signforge.Exceptions.ValidationCException;
import com.theweplm.signforge.Features.Authentication.Constants.AuthenticationCON;
import com.theweplm.signforge.Features.Authentication.Models.AuthResponseDTO;
import com.theweplm.signforge.Features.Authentication.Models.LoginRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.RefreshTokenRequestDTO;
import com.theweplm.signforge.Features.Authentication.Models.UserProfileDTO;
import com.theweplm.signforge.Helpers.JwtTokenHelper;
import com.theweplm.signforge.Helpers.PasswordHashHelper;
import com.theweplm.signforge.Models.Classes.UserEntityClass;
import com.theweplm.signforge.Repositories.IUserRepository;
import com.theweplm.signforge.Validators.EmailSValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements IAuthenticationService {

    private final IUserRepository userRepository;

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        if (!EmailSValidator.getCurrent().validate(request.getEmail())) {
            throw new ValidationCException("A valid email address is required.");
        }

        Optional<UserEntityClass> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            throw new ValidationCException(AuthenticationCON.INVALID_CREDENTIALS_ERROR);
        }

        UserEntityClass user = userOpt.get();
        if (!PasswordHashHelper.getCurrent().verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new ValidationCException(AuthenticationCON.INVALID_CREDENTIALS_ERROR);
        }

        if (!user.isActive()) {
            throw new ValidationCException(AuthenticationCON.ACCOUNT_INACTIVE_ERROR);
        }

        String accessToken = JwtTokenHelper.getCurrent().generateAccessToken(
                user.getId().toString(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName() + " " + user.getLastName(),
                AuthenticationCON.DEFAULT_JWT_EXPIRY_MINUTES
        );
        String refreshToken = JwtTokenHelper.getCurrent().generateRefreshToken();

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiryTime(Instant.now().plus(AuthenticationCON.DEFAULT_JWT_REFRESH_EXPIRY_DAYS, ChronoUnit.DAYS));
        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresAt(Instant.now().plus(AuthenticationCON.DEFAULT_JWT_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .user(mapToUserProfile(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String token = request.getRefreshToken();
        Optional<UserEntityClass> userOpt = userRepository.findByRefreshToken(token);

        if (userOpt.isEmpty()) {
            throw new ValidationCException(AuthenticationCON.INVALID_TOKEN_ERROR);
        }

        UserEntityClass matchedUser = userOpt.get();
        if (matchedUser.getRefreshTokenExpiryTime() == null || Instant.now().isAfter(matchedUser.getRefreshTokenExpiryTime())) {
            throw new ValidationCException(AuthenticationCON.INVALID_TOKEN_ERROR);
        }

        String newAccessToken = JwtTokenHelper.getCurrent().generateAccessToken(
                matchedUser.getId().toString(),
                matchedUser.getEmail(),
                matchedUser.getRole(),
                matchedUser.getFirstName() + " " + matchedUser.getLastName(),
                AuthenticationCON.DEFAULT_JWT_EXPIRY_MINUTES
        );
        String newRefreshToken = JwtTokenHelper.getCurrent().generateRefreshToken();

        matchedUser.setRefreshToken(newRefreshToken);
        matchedUser.setRefreshTokenExpiryTime(Instant.now().plus(AuthenticationCON.DEFAULT_JWT_REFRESH_EXPIRY_DAYS, ChronoUnit.DAYS));
        matchedUser.setUpdatedAt(Instant.now());
        userRepository.save(matchedUser);

        return AuthResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresAt(Instant.now().plus(AuthenticationCON.DEFAULT_JWT_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .user(mapToUserProfile(matchedUser))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentUser(UUID userId) {
        UserEntityClass user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationCException(AuthenticationCON.USER_NOT_FOUND_ERROR));
        return mapToUserProfile(user);
    }

    private UserProfileDTO mapToUserProfile(UserEntityClass user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .avatarUrl(user.getAvatarUrl())
                .isVerified(user.isVerified())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
