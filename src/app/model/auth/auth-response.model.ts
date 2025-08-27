import { User } from '../user/user.model';
import { UserRole } from '../../shared/enums/user-role.enum';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface AuthData {
  user: User;
  tokens: TokenData;
  permissions?: string[];
  lastLogin?: Date;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
  expiresAt: Date;
  scope?: string[];
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data: {
    otpSent: boolean;
    expiresAt: Date;
    attemptsRemaining: number;
    canResendAt?: Date;
  };
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    user?: User;
    tokens?: TokenData;
    nextStep?: AuthStep;
    attemptsRemaining?: number;
  };
}

export enum AuthStep {
  PHONE_VERIFICATION = 'phone_verification',
  ROLE_SELECTION = 'role_selection',
  PROFILE_SETUP = 'profile_setup',
  COMPLETE = 'complete'
}

export interface RoleSelectionResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    roleUpdated: boolean;
    nextStep?: AuthStep;
  };
}

export interface ProfileSetupResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profileCompleted: boolean;
    tokens: TokenData;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    tokens: TokenData;
    user?: User;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data?: {
    loggedOut: boolean;
    tokensRevoked: boolean;
  };
}