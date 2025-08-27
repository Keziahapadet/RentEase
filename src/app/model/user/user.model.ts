           import { BaseEntity } from '../common/base.model';
import { UserRole } from '../../shared/enums/user-role.enum';
import { UserStatus } from '../../shared/enums/user-status.enum';

export interface User extends BaseEntity {
  phone: string;
  name: string;
  email?: string;
  role?: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profileCompleted: boolean;
  lastLogin?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  profileCompletedAt?: Date;
  preferences?: UserPreferences;
  metadata?: UserMetadata;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  theme: ThemeSettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  contactInfoVisible: boolean;
  showOnlineStatus: boolean;
  allowSearchByPhone: boolean;
  allowSearchByEmail: boolean;
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONTACTS_ONLY = 'contacts_only'
}

export interface ThemeSettings {
  mode: ThemeMode;
  primaryColor: string;
  fontSize: FontSize;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export interface UserMetadata {
  registrationSource?: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  lastActive?: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}