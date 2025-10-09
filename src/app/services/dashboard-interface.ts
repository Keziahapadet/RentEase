import { User, ExtendedUser, ApiResponse } from './auth-interfaces';

export interface ProfilePictureResponse {
  success: boolean;
  message: string;
  pictureUrl?: string;
}

export interface Unit {
  id: string | number;
  unitNumber: string;
  unitType: string;
  rentAmount: number;
  deposit: number;
  description?: string;
  status?: "occupied" | "vacant" | "maintenance" | "reserved" | "";
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

export interface Property {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  units?: Unit[];
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface UnitRequest {
  unitNumber: string;
  unitType: string;
  rentAmount: number;
  deposit: number;
  description?: string;
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

export interface UnitResponse {
  success: boolean;
  message: string;
  unit?: Unit;
}

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  annualRevenue: number;
  pendingRent: number;
  totalTenants: number;
}

export interface StatCardConfig {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  route: string[];
  queryParams?: any;
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

export interface InviteDialogData {
  type: string;
  propertyId: string;
  propertyName: string;
  availableUnits: any[];
}

export interface InviteTenantRequest {
  tenantEmail: string;
  unitId: number;
}

export interface InviteCaretakerRequest {
  caretakerEmail: string;
  propertyId: number;
}

export interface AcceptInvitationRequest {
  invitationToken: string;
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  invitation?: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    propertyId?: string;
    unitId?: string;
  };
}