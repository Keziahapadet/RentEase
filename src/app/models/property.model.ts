
export interface PropertyCreateRequest {
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
}


export interface PropertyResponse {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  description?: string;
  status?: string;          
  createdDate?: string;
  updatedDate?: string;
  ownerId?: string;
}
export interface Property extends PropertyResponse {

  status: string;

  occupiedUnits?: number;
  monthlyRevenue?: number;
  imageUrl?: string;
}
export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  monthlyRevenue: number;
  occupancyRate: number;
}
export interface PropertyFilter {
  status?: 'all' | 'active' | 'inactive';
  propertyType?: string;
  searchTerm?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
