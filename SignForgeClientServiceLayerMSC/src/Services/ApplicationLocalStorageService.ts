import { LoginAuthState } from '../Features/LoginScreen/Models/LoginScreenModel';
import ApplicationLocalStorageCON from '../Constants/ApplicationLocalStorageCON';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export default class ApplicationLocalStorageService {
  public static current: ApplicationLocalStorageService = new ApplicationLocalStorageService();

  private readonly accessTokenStorageKey: string = ApplicationLocalStorageCON.ACCESS_TOKEN_STORAGE_KEY;
  private readonly refreshTokenStorageKey: string = ApplicationLocalStorageCON.REFRESH_TOKEN_STORAGE_KEY;
  private readonly authSessionStorageKey: string = ApplicationLocalStorageCON.AUTH_SESSION_STORAGE_KEY;

  // Access Token Management (Tab-scoped sessionStorage with smart localStorage inheritance)
  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionToken = sessionStorage.getItem(this.accessTokenStorageKey);
      if (sessionToken) return sessionToken;

      // Smart Inheritance: If new tab has no sessionToken, bootstrap from localStorage
      const localToken = localStorage.getItem(this.accessTokenStorageKey);
      if (localToken) {
        sessionStorage.setItem(this.accessTokenStorageKey, localToken);
        return localToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  public setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.accessTokenStorageKey, token);
        localStorage.setItem(this.accessTokenStorageKey, token);
      } catch (error) {
        console.error('Failed to save access token:', error);
      }
    }
  }

  // Refresh Token Management
  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionToken = sessionStorage.getItem(this.refreshTokenStorageKey);
      if (sessionToken) return sessionToken;

      const localToken = localStorage.getItem(this.refreshTokenStorageKey);
      if (localToken) {
        sessionStorage.setItem(this.refreshTokenStorageKey, localToken);
        return localToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  public setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.refreshTokenStorageKey, token);
        localStorage.setItem(this.refreshTokenStorageKey, token);
      } catch (error) {
        console.error('Failed to save refresh token:', error);
      }
    }
  }

  // Dual Tokens Helper
  public setAuthTokens(tokens: AuthTokens): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  public clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(this.accessTokenStorageKey);
        sessionStorage.removeItem(this.refreshTokenStorageKey);
        localStorage.removeItem(this.accessTokenStorageKey);
        localStorage.removeItem(this.refreshTokenStorageKey);
      } catch (error) {
        console.error('Failed to clear tokens:', error);
      }
    }
  }

  // Auth Session State Management (Tab-scoped sessionStorage with smart inheritance)
  public getAuthSession(): LoginAuthState | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionData = sessionStorage.getItem(this.authSessionStorageKey);
      if (sessionData) {
        return JSON.parse(sessionData) as LoginAuthState;
      }

      // Smart Inheritance: If new tab has no sessionData, bootstrap from localStorage
      const localData = localStorage.getItem(this.authSessionStorageKey);
      if (localData) {
        sessionStorage.setItem(this.authSessionStorageKey, localData);
        return JSON.parse(localData) as LoginAuthState;
      }
    } catch {
      return null;
    }
    return null;
  }

  public setAuthSession(session: LoginAuthState): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.authSessionStorageKey, JSON.stringify(session));
        localStorage.setItem(this.authSessionStorageKey, JSON.stringify(session));
      } catch (error) {
        console.error('Failed to save auth session:', error);
      }
    }
  }

  public clearAuthSession(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(this.authSessionStorageKey);
        localStorage.removeItem(this.authSessionStorageKey);
      } catch (error) {
        console.error('Failed to clear auth session:', error);
      }
    }
  }

  // Clear All Authentication Data
  public clearAllAuthData(): void {
    this.clearAuthTokens();
    this.clearAuthSession();
  }
}
