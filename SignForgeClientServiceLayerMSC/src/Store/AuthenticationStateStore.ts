import { create } from 'zustand';
import { UserRoleType } from '../Types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
}

export interface AuthenticationState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthenticationStateStore = create<AuthenticationState>((set) => ({
  user: {
    id: 'user-admin-1',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@weplm.com',
    role: 'HR_ADMIN'
  },
  setUser: (user) => set({ user })
}));

export default useAuthenticationStateStore;
