import { create } from 'zustand';
import { AuthenticationStateStoreInterface, AuthTokens } from './Interface/AuthenticationStateStoreInterface';
import { UserProfileType } from '../Features/LoginScreen/Models/LoginScreenModel';

export const useAuthenticationStateStore = create<AuthenticationStateStoreInterface>((set) => ({
  isAuthenticated: false,
  user: null,
  tokens: null,

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
