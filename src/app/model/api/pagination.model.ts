  
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  filters?: { [key: string]: any };
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface FilterOption {
  key: string;
  value: any;
  operator?: FilterOperator;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  NOT_IN = 'notIn'
}