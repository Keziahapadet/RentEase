// src/app/services/auth-interfaces.ts

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  avatar?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  accessCode?: string; // Only for ADMIN registration
}

// Response for ADMIN login (with token)
export interface AdminAuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
  message?: string;
}

// Response for non-ADMIN login (no token)
export interface UserAuthResponse {
  user: User;
  message?: string;
  success: boolean;
}

// Registration response (same for all roles)
export interface RegisterResponse {
  user?: User;
  message: string;
  success: boolean;
  token?: string; // Only if admin
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

// Enum for user roles
export enum UserRole {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  ADMIN = 'ADMIN',
  PROPERTY_MANAGER = 'PROPERTY_MANAGER'
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}