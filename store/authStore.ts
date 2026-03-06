import { User } from '@/types/auth';
import { create } from 'zustand'



interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;         // true while checking stored tokens on app launch

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;   // used by refresh interceptor
  logout: () => void;
  setLoading: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,   // starts true — we don't know auth status yet on launch

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isAuthenticated: true, isLoading: false })
  },

  setAccessToken: (token) =>
    set({ accessToken: token }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setLoading: (val) =>
    set({ isLoading: val }),

}));