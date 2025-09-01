export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  CARETAKER = 'caretaker',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  address?: string;
  emergencyContact?: string;
  employmentStatus?: string;
  businessDetails?: BusinessDetails;
}

export interface BusinessDetails {
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxCertificate?: string;
  serviceDescription: string;
  operatingHours: string;
  coverageArea: string;
}