// Request model for creating properties (matches your backend DTO)
export interface PropertyCreateRequest {
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
}

// Response model from backend
export interface PropertyResponse {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
  status?: string;          // ✅ optional (backend may omit)
  createdDate?: string;
  updatedDate?: string;
  ownerId?: string;
}

// Extended property model for frontend use
export interface Property extends PropertyResponse {
  // ✅ Override status to be required in frontend
  status: string;

  // Extra frontend-only fields
  occupiedUnits?: number;
  monthlyRevenue?: number;
  imageUrl?: string;
}

// Property statistics model
export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

// Property filter options
export interface PropertyFilter {
  status?: 'all' | 'active' | 'inactive';
  propertyType?: string;
  searchTerm?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
