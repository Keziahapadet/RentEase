export interface TenantUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  initials: string;
  dateOfBirth?: string;
  nationalId?: string;
  occupation?: string;
  emergencyContact?: EmergencyContact;
  preferences?: UserPreferences;
  isActive: boolean;
  dateRegistered: string;
  lastLogin?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface UserPreferences {
  language: 'en' | 'sw';
  currency: 'KSH' | 'USD';
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  seller: string;
  category: 'items' | 'services' | 'housing';
  datePosted: string;
}
