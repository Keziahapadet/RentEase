      export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  timestamp: Date;
  statusCode?: number;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiMetadata {
  version: string;
  requestId?: string;
  executionTime?: number;
}
