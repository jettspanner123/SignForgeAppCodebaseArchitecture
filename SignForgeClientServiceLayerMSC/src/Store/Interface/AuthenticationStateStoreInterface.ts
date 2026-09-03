import { UserProfileType } from '../../Features/LoginScreen/Models/LoginScreenModel';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthenticationStateStoreInterface {
  isAuthenticated: boolean;
  user: UserProfileType | null;
  tokens: AuthTokens | null;
  setAuth: (tokens: AuthTokens, user: UserProfileType) => void;
  clearAuth: () => void;
}
