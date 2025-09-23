
export interface User {
  id: string | number; // backend gives userId: number
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole | string; // typed enum + string fallback
  avatar?: string;
  emailVerified?: boolean;
  verified?: boolean; // matches backend response field
  createdAt?: string;
  updatedAt?: string;
}

// ================= AUTH REQUEST INTERFACES =================

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
  role: UserRole | string;
  accessCode?: string; // Only for ADMIN registration
}

// ================= AUTH RESPONSE INTERFACES =================

// Unified login response (LANDLORD, TENANT, CARETAKER, BUSINESS, ADMIN)
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole | string;
  verified: boolean;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
}

// Registration response
export interface RegisterResponse {
  user?: User;
  message: string;
  success: boolean;
  token?: string; // only for ADMIN, if returned
}

// ================= PASSWORD RESET INTERFACES =================

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

// ================= OTP INTERFACES =================

export interface OtpRequest {
  email: string;
  type: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification';
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string; // FIXED: Changed from 'otp' to 'otpCode' to match server expectation
  type: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification';
}

export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string; // Optional token for certain verification types
  user?: User;    // FIXED: Added user data returned on successful email verification
}

// ================= PROPERTY INTERFACES =================

export interface PropertyRequest {
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  property?: Property;
}
export interface Property {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
  ownerId: string;
  createdAt: string;  // must match everywhere
  updatedAt: string;  // must match everywhere
  status?: 'active' | 'inactive' | 'maintenance'; // optional, needed for template
}

// ================= OTHER INTERFACES =================

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

// Enum for user roles
export enum UserRole {
  TENANT = 'TENANT',
  CARETAKER = 'CARETAKER',
  LANDLORD = 'LANDLORD',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}

// Auth state interface (used for NgRx or local state)
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}
