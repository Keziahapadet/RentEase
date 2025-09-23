// src/app/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PropertyRequest, PropertyResponse, Property } from './auth-interfaces';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly apiUrl = 'https://rentease-nch9.onrender.com';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ---------------- PROPERTY CRUD ----------------
  createProperty(request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: Number(request.totalUnits),
      description: request.description?.trim() || ''
    };
    return this.http.post<PropertyResponse>(`${this.apiUrl}/api/landlord/properties`, backendRequest, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getProperties(): Observable<
    Property[] | { data: Property[] } | { properties: Property[] } | { content: Property[] }
  > {
    const httpOptions = { headers: this.createHeaders() };
    return this.http.get<
      Property[] | { data: Property[] } | { properties: Property[] } | { content: Property[] }
    >(`${this.apiUrl}/api/landlord/properties`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getPropertyById(propertyId: string): Observable<Property> {
    const httpOptions = { headers: this.createHeaders() };
    return this.http.get<Property>(`${this.apiUrl}/api/landlord/properties/${propertyId}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateProperty(propertyId: string, request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: Number(request.totalUnits),
      description: request.description?.trim() || ''
    };
    return this.http.put<PropertyResponse>(`${this.apiUrl}/api/landlord/properties/${propertyId}`, backendRequest, httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteProperty(propertyId: string): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };
    return this.http.delete<PropertyResponse>(`${this.apiUrl}/api/landlord/properties/${propertyId}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  // ---------------- HELPERS ----------------
  private createHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  };

  // ---------------- NEW METHODS ----------------

  /**
   * Checks if the current user can manage properties (landlord role)
   */
  canManageProperties(): boolean {
    const userRole = this.authService.getCurrentUser()?.role || '';
    return userRole.toLowerCase() === 'landlord';
  }

  /**
   * Validates property data before sending to backend
   * Returns array of error messages (empty array if valid)
   */
  validatePropertyData(data: any): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Property name cannot be empty');
    }

    if (!data.location || data.location.trim().length === 0) {
      errors.push('Location cannot be empty');
    }

    if (!data.propertyType) {
      errors.push('Property type is required');
    }

    if (isNaN(data.totalUnits) || data.totalUnits < 1) {
      errors.push('Total units must be a number greater than 0');
    }

    return errors;
  }
}
