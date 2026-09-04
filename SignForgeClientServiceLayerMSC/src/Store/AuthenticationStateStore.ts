import { create } from 'zustand';
import { AuthenticationStateStoreInterface, AuthTokens } from './Interface/AuthenticationStateStoreInterface';
import { UserProfileType } from '../Features/LoginScreen/Models/LoginScreenModel';
import ApplicationLocalStorageService from '../Services/ApplicationLocalStorageService';

// Initialize state from persisted local storage session if present
const initialSession = ApplicationLocalStorageService.current.getAuthSession();
const initialAccessToken = ApplicationLocalStorageService.current.getAccessToken();
const initialRefreshToken = ApplicationLocalStorageService.current.getRefreshToken();

const hasValidPersistedAuth = Boolean(initialSession && initialAccessToken);

export const useAuthenticationStateStore = create<AuthenticationStateStoreInterface>((set) => ({
  isAuthenticated: hasValidPersistedAuth,
  user: initialSession?.user || null,
  tokens: hasValidPersistedAuth
    ? {
        accessToken: initialAccessToken || '',
        refreshToken: initialRefreshToken || '',
        expiresAt: initialSession?.user ? undefined : undefined,
      }
    : null,

  setAuth: (tokens: AuthTokens, user: UserProfileType) => {
    set({
      isAuthenticated: true,
      tokens,
      user,
    });
  },

  clearAuth: () => {
    set({
      isAuthenticated: false,
      user: null,
      tokens: null,
    });
  },
}));

export default useAuthenticationStateStore;
