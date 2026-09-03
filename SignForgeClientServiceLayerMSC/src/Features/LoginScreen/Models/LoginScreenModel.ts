export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface UserProfileType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
}

export interface LoginAuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: UserProfileType | null;
}

export interface BackendUserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
}

export interface BackendAuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: BackendUserProfileDTO;
}

export interface BackendApiResponseEnvelope<T> {
  data: T | null;
  success: boolean;
  message: string;
  errors: string[] | null;
  statusCode: number;
}
