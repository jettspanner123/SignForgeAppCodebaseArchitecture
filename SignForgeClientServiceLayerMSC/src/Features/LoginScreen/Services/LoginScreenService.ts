import {
  LoginCredentials,
  LoginFormErrors,
  LoginAuthState,
  UserProfileType,
} from '../Models/LoginScreenModel';
import LoginScreenCON from '../Constants/LoginScreenCON';
import useAuthenticationStateStore from '../../../Store/AuthenticationStateStore';

export default class LoginScreenService {
  public static current: LoginScreenService = new LoginScreenService();

  public validate(credentials: LoginCredentials): LoginFormErrors {
    const errors: LoginFormErrors = {};

    if (!credentials.email.trim()) {
      errors.email = LoginScreenCON.ERROR_EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email.trim())) {
      errors.email = LoginScreenCON.ERROR_EMAIL_INVALID;
    }

    if (!credentials.password) {
      errors.password = LoginScreenCON.ERROR_PASSWORD_REQUIRED;
    } else if (credentials.password.length < 6) {
      errors.password = LoginScreenCON.ERROR_PASSWORD_LENGTH;
    }

    return errors;
  }

  /**
   * Simulated authentication service for prototype / demo workflow.
   * Ready for 1:1 TanStack Query / Spring Boot backend integration.
   */
  public async authenticateSimulated(credentials: LoginCredentials): Promise<LoginAuthState> {
    // Artificial slight delay for realistic feeling
    await new Promise((resolve) => setTimeout(resolve, 600));

    const simulatedUser: UserProfileType = {
      id: '22222222-2222-2222-2222-222222222222',
      email: credentials.email.trim(),
      firstName: 'Priya',
      lastName: 'Sharma',
      fullName: 'Priya Sharma',
      role: 'HR_MANAGER',
      department: 'HUMAN_RESOURCES',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      lastLoginAt: new Date().toISOString(),
    };

    const authTokens = {
      accessToken: 'simulated_jwt_token_signforge_2026',
      refreshToken: 'simulated_refresh_token_signforge_2026',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    useAuthenticationStateStore.getState().setAuth(authTokens, simulatedUser);

    return {
      isAuthenticated: true,
      userEmail: simulatedUser.email,
      userName: simulatedUser.fullName,
      userRole: simulatedUser.role,
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
      user: simulatedUser,
    };
  }
}
