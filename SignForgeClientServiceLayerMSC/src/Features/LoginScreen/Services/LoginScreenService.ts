import {
  LoginCredentials,
  LoginFormErrors,
  LoginAuthState,
  BackendAuthResponseDTO,
  BackendApiResponseEnvelope,
  UserProfileType,
} from '../Models/LoginScreenModel';
import LoginScreenCON from '../Constants/LoginScreenCON';
import ApplicationNetworkAPIConfiguration from '../../../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from '../../../Services/ApplicationLocalStorageService';
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

  public async authenticateWithCredentials(credentials: LoginCredentials): Promise<LoginAuthState> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const loginEndpoint = config.endpoints.authentication.login;

    let response: Response;
    try {
      response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          Email: credentials.email.trim(),
          Password: credentials.password,
        }),
      });
    } catch (networkError) {
      console.error('Backend authentication network error:', networkError);
      throw new Error(`Unable to connect to orchestrator service at ${config.baseUrl}. Please verify the backend is running.`);
    }

    let payload: BackendApiResponseEnvelope<BackendAuthResponseDTO> | null = null;
    try {
      payload = (await response.json()) as BackendApiResponseEnvelope<BackendAuthResponseDTO>;
    } catch {
      throw new Error('Invalid response received from authentication server.');
    }

    const isSuccess = payload?.Success ?? (payload as unknown as Record<string, unknown>)?.success === true;
    const authData = payload?.Data ?? ((payload as unknown as Record<string, unknown>)?.data as BackendAuthResponseDTO | undefined);

    if (!response.ok || !payload || !isSuccess || !authData) {
      const errorMessage =
        payload?.Message ||
        (payload as unknown as Record<string, unknown>)?.message as string ||
        payload?.Errors?.join(', ') ||
        'Authentication failed. Please verify your credentials.';
      throw new Error(errorMessage);
    }

    const accessToken = authData.AccessToken || (authData as unknown as Record<string, string>).accessToken;
    const refreshToken = authData.RefreshToken || (authData as unknown as Record<string, string>).refreshToken;
    const expiresAt = authData.ExpiresAt || (authData as unknown as Record<string, string>).expiresAt;

    // Save tokens via dedicated LocalStorage Service
    ApplicationLocalStorageService.current.setAuthTokens({
      accessToken,
      refreshToken,
      expiresAt,
    });

    const userProfile = authData.User || (authData as unknown as Record<string, unknown>).user as typeof authData.User;
    const rawUser = userProfile as unknown as Record<string, unknown>;

    const id = userProfile?.Id || (rawUser?.id as string) || '';
    const email = userProfile?.Email || (rawUser?.email as string) || '';
    const firstName = userProfile?.FirstName || (rawUser?.firstName as string) || '';
    const lastName = userProfile?.LastName || (rawUser?.lastName as string) || '';
    const fullName = userProfile?.FullName || (rawUser?.fullName as string) || `${firstName} ${lastName}`.trim() || 'Enterprise User';
    const role = String(userProfile?.Role || rawUser?.role || 'USER');
    const department = userProfile?.Department ? String(userProfile.Department) : (rawUser?.department ? String(rawUser.department) : null);
    const avatarUrl = userProfile?.AvatarUrl || (rawUser?.avatarUrl as string) || null;
    const lastLoginAt = userProfile?.LastLoginAt || (rawUser?.lastLoginAt as string) || null;

    const typedUser: UserProfileType = {
      id,
      email,
      firstName,
      lastName,
      fullName,
      role,
      department,
      avatarUrl,
      lastLoginAt,
    };

    // Save to Zustand State Store
    useAuthenticationStateStore.getState().setAuth(
      {
        accessToken,
        refreshToken,
        expiresAt,
      },
      typedUser
    );

    const authState: LoginAuthState = {
      isAuthenticated: true,
      userEmail: typedUser.email,
      userName: typedUser.fullName,
      userRole: typedUser.role,
      accessToken,
      refreshToken,
      user: typedUser,
    };

    // Save session via dedicated LocalStorage Service
    ApplicationLocalStorageService.current.setAuthSession(authState);

    return authState;
  }

  public async authenticateWithMicrosoft(): Promise<LoginAuthState> {
    throw new Error('Microsoft Single Sign-On requires corporate Azure Active Directory configuration.');
  }

  public getSavedSession(): LoginAuthState | null {
    return ApplicationLocalStorageService.current.getAuthSession();
  }

  public clearSession(): void {
    ApplicationLocalStorageService.current.clearAllAuthData();
    useAuthenticationStateStore.getState().clearAuth();
  }
}
