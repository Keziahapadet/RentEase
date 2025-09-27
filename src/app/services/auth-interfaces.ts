
export enum UserRole {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  CARETAKER = 'CARETAKER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}
export interface Unit {
  id: string | number;
  unitNumber: string;       
  unitType: string;         
  rentAmount: number;        
  deposit: number;          
  description?: string; 

  status?: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
  tenant?: {
    id?: string;
    name?: string;
    email?: string;
  } | null; 
  
 
  type?: string;         
  rent?: number;           
  bedrooms?: number;      
  bathrooms?: number;     
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
export interface User {
  id: string | number; 
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole | string; 
  avatar?: string;
  emailVerified?: boolean;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


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
  accessCode?: string; 
}

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
  success?: boolean;
  user?: User;
}

export interface RegisterResponse {
  user?: User;
  message: string;
  success: boolean;
  token?: string; 
}


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


export interface OtpRequest {
  email: string;
  type: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification';
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string; 
  type: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification';
}

export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string; 
  user?: User; 
}




export interface UnitRequest {
  unitNumber: string;
  unitType: string;
  rentAmount: number;
  deposit: number;
  unitDescription?: string;
}


export interface PropertyRequest {
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
  units?: UnitRequest[]; 
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
  createdAt: string; 
  updatedAt: string; 
  status?: 'active' | 'inactive' | 'maintenance'; 
}


export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}


export type AuthenticationStatus = 'authenticated' | 'unauthenticated' | 'pending';

export type UserRoleType = keyof typeof UserRole;


export interface ValidationErrors {
  [key: string]: string | boolean;
}

export interface FormFieldError {
  field: string;
  message: string;
}


export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters?: Record<string, any>;
}