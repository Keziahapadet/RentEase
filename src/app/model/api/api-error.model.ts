         export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ErrorDetails;
  timestamp: Date;
  path?: string;
  statusCode: number;
}

export interface ErrorDetails {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  validationErrors?: ValidationError[];
  stack?: string; // Only in development
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  code: string;
}

export interface HttpErrorInfo {
  url?: string;
  method?: string;
  headers?: any;
  body?: any;
}