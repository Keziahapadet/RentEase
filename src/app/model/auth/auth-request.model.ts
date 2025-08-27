      export interface RegistrationRequest {
  phone: string;
  name: string;
  acceptTerms?: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    phone: string;
    status: string;
    otpSent: boolean;
    expiresAt: Date;
  };
}

export interface LoginRequest {
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    phone: string;
    otpSent: boolean;
    expiresAt: Date;
  };
}

export interface OtpVerificationRequest {
  phone: string;
  otp: string;
  type: OtpType;
}

export enum OtpType {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset'
}

export interface ResendOtpRequest {
  phone: string;
  type: OtpType;
}

export interface RoleSelectionRequest {
  userId: string;
  role: string;
}

export interface ProfileSetupRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  address?: string;
  city?: string;
  bio?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
