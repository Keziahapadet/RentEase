      export interface LoginCredentials {
  phone: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: LoginUser;
  requiresOtp: boolean;
  otpSent?: boolean;
  message: string;
  error?: string;
}

export interface LoginUser {
  id: string;
  phone: string;
  name: string;
  role: string;
  status: string;
  lastLogin: Date;
  isFirstLogin: boolean;
}

export interface LoginSession {
  sessionId: string;
  userId: string;
  phone: string;
  loginTime: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  os?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface LoginAttempt {
  phone: string;
  attemptTime: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  loginTime: Date;
  logoutTime?: Date;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
  sessionDuration?: number; // in minutes
}

export interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireOtpForLogin: boolean;
  allowMultipleSessions: boolean;
}
