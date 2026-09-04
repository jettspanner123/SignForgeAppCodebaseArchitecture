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
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  FullName?: string;
  Role: string;
  Department?: string | null;
  AvatarUrl?: string | null;
  LastLoginAt?: string | null;
}

export interface BackendAuthResponseDTO {
  AccessToken: string;
  RefreshToken: string;
  ExpiresAt: string;
  User: BackendUserProfileDTO;
}

export interface BackendApiResponseEnvelope<T> {
  Data: T | null;
  Success: boolean;
  Message: string;
  Errors: string[] | null;
  StatusCode: number;
}
