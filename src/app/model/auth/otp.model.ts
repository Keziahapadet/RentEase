     export interface Otp {
  id?: string;
  phone: string;
  code: string;
  type: OtpType;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isVerified: boolean;
  isExpired: boolean;
  userId?: string;
}

export enum OtpType {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
  PHONE_VERIFICATION = 'phone_verification',
  TWO_FACTOR_AUTH = 'two_factor_auth'
}

export interface OtpVerification {
  isValid: boolean;
  isExpired: boolean;
  message: string;
  attemptsRemaining: number;
  canResend: boolean;
  nextResendAt?: Date;
}

export interface OtpConfig {
  length: number;
  expiryMinutes: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
  allowedRetries: number;
}

export interface OtpGenerationResult {
  code: string;
  expiresAt: Date;
  sent: boolean;
  message?: string;
  error?: string;
}

export interface OtpValidationRequest {
  phone: string;
  code: string;
  type: OtpType;
}

export interface OtpValidationResult {
  isValid: boolean;
  isExpired: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  message: string;
  nextAllowedAttempt?: Date;
}

export interface OtpResendRequest {
  phone: string;
  type: OtpType;
}

export interface OtpResendResult {
  success: boolean;
  newCode?: string;
  expiresAt?: Date;
  message: string;
  cooldownSeconds?: number;
  canResendAt?: Date;
}

export interface OtpStatistics {
  totalGenerated: number;
  totalVerified: number;
  totalExpired: number;
  totalFailed: number;
  averageVerificationTime: number; // in seconds
  successRate: number; // percentage
}