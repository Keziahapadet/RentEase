    export interface AppConfiguration {
  app: AppInfo;
  api: ApiConfiguration;
  auth: AuthConfiguration;
  upload: UploadConfiguration;
  notifications: NotificationConfiguration;
  features: FeatureFlags;
}

export interface AppInfo {
  name: string;
  version: string;
  environment: Environment;
  buildDate: Date;
  buildNumber: string;
  description: string;
  author: string;
  license: string;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

export interface ApiConfiguration {
  baseUrl: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  rateLimit: RateLimitConfig;
  endpoints: ApiEndpoints;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface ApiEndpoints {
  auth: Record<string, string>;
  user: Record<string, string>;
  dashboard: Record<string, string>;
  uploads: Record<string, string>;
}

export interface AuthConfiguration {
  tokenExpiry: number;
  refreshTokenExpiry: number;
  otpConfig: OtpConfiguration;
  passwordPolicy: PasswordPolicy;
  sessionConfig: SessionConfiguration;
}

export interface OtpConfiguration {
  length: number;
  expiryMinutes: number;
  maxAttempts: number;
  resendCooldown: number;
  allowedRetries: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords
}

export interface SessionConfiguration {
  timeout: number; // minutes
  extendOnActivity: boolean;
  maxConcurrentSessions: number;
  requireOtpForSensitiveOperations: boolean;
}

export interface UploadConfiguration {
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  uploadPath: string;
  cdnUrl: string;
}

export interface NotificationConfiguration {
  email: EmailConfiguration;
  sms: SmsConfiguration;
  push: PushConfiguration;
}

export interface EmailConfiguration {
  provider: string;
  templates: Record<string, EmailTemplate>;
  fromAddress: string;
  fromName: string;
}

export interface EmailTemplate {
  id: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface SmsConfiguration {
  provider: string;
  templates: Record<string, SmsTemplate>;
  fromNumber: string;
}

export interface SmsTemplate {
  id: string;
  message: string;
  variables: string[];
}

export interface PushConfiguration {
  provider: string;
  serverKey: string;
  vapidKeys: VapidKeys;
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

export interface FeatureFlags {
  enableRegistration: boolean;
  enableSocialLogin: boolean;
  enableTwoFactorAuth: boolean;
  enableEmailVerification: boolean;
  enablePhoneVerification: boolean;
  enableDarkMode: boolean;
  enableNotifications: boolean;
  enableFileUpload: boolean;
  enableMultiLanguage: boolean;
  maintenanceMode: boolean;
}

export interface ValidationRules {
  phone: ValidationRule;
  email: ValidationRule;
  name: ValidationRule;
  password: ValidationRule;
  otp: ValidationRule;
}

export interface ValidationRule {
  pattern: string;
  message: string;
  minLength?: number;
  maxLength?: number;
  required: boolean;
}

export interface ApplicationLimits {
  maxUsers: number;
  maxLoginAttempts: number;
  maxFileUploads: number;
  maxRequestsPerMinute: number;
  maxSessionDuration: number;
}
