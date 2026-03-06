/** shape of a user object returned by the backend */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  isVerified?: boolean;
  // any additional fields may be added here
  [key: string]: unknown;
}

/** data sent to the register endpoint */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** data sent to the login endpoint */
export interface LoginPayload {
  email: string;
  password: string;
}

/** (optional) store shape if you want to reuse it elsewhere */
export interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}