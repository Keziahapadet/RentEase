      import { BaseEntity } from '../common/base.model';

export interface UserProfile extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName?: string;
  email?: string;
  alternativePhone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  avatar?: string;
  bio?: string;
  website?: string;
  
  // Address Information
  address: Address;
  
  // Professional Information
  occupation?: string;
  company?: string;
  industry?: string;
  workExperience?: number; // years
  
  // Emergency Contact
  emergencyContact?: EmergencyContact;
  
  // Verification Status
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  verificationDocuments?: VerificationDocument[];
  
  // Profile Completion
  completionPercentage: number;
  missingFields?: string[];
  
  // Social Media
  socialMedia?: SocialMediaLinks;
  
  // Settings
  isPublic: boolean;
  showContactInfo: boolean;
  allowMessages: boolean;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export interface Address {
  street?: string;
  apartment?: string;
  city: string;
  county?: string;
  postalCode?: string;
  country: string;
  coordinates?: Coordinates;
  isDefault: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export enum VerificationLevel {
  NONE = 'none',
  BASIC = 'basic',      // Phone verified
  STANDARD = 'standard', // Phone + Email verified
  ENHANCED = 'enhanced', // Phone + Email + ID verified
  PREMIUM = 'premium'    // Full KYC verified
}

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  number: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  status: DocumentStatus;
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export enum DocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  address?: Partial<Address>;
  occupation?: string;
  company?: string;
  website?: string;
  socialMedia?: Partial<SocialMediaLinks>;
  preferences?: any;
}

export interface ProfileValidation {
  isValid: boolean;
  errors: ProfileValidationError[];
  warnings: ProfileValidationWarning[];
  completionPercentage: number;
}

export interface ProfileValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ProfileValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
