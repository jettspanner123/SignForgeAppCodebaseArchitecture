package com.theweplm.signforge.Features.Authentication.Constants;

public final class AuthenticationCON {
    public static final String DEFAULT_DOMAIN = "theweplm.com";
    public static final String INVALID_CREDENTIALS_ERROR = "Invalid email or password combination provided.";
    public static final String USER_NOT_FOUND_ERROR = "User account not found.";
    public static final String ACCOUNT_INACTIVE_ERROR = "This account is currently inactive. Please contact your system administrator.";
    public static final String INVALID_TOKEN_ERROR = "Invalid or expired refresh token.";
    public static final int DEFAULT_JWT_EXPIRY_MINUTES = 1440; // 24 hours
    public static final int DEFAULT_JWT_REFRESH_EXPIRY_DAYS = 7;

    private AuthenticationCON() {}
}
