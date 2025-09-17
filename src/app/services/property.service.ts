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
  private readonly apiUrl = 'http://10.20.33.70:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ============ PROPERTY CRUD OPERATIONS ============

  /**
   * Create a new property
   */
  createProperty(request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = {
      headers: this.createHeaders()
    };

    // Transform data to match your backend format
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: request.totalUnits.toString(), // Backend expects string
      description: request.description?.trim() || ''
    };

    return this.http.post<PropertyResponse>(`${this.apiUrl}/landlord/properties`, backendRequest, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all properties for the authenticated landlord
   */
  getProperties(): Observable<Property[]> {
    const httpOptions = {
      headers: this.createHeaders()
    };

    return this.http.get<Property[]>(`${this.apiUrl}/landlord/properties`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a specific property by ID
   */
  getPropertyById(propertyId: string): Observable<Property> {
    const httpOptions = {
      headers: this.createHeaders()
    };

    return this.http.get<Property>(`${this.apiUrl}/landlord/properties/${propertyId}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing property
   */
  updateProperty(propertyId: string, request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = {
      headers: this.createHeaders()
    };

    // Transform data to match your backend format
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: request.totalUnits.toString(), // Backend expects string
      description: request.description?.trim() || ''
    };

    return this.http.put<PropertyResponse>(`${this.apiUrl}/landlord/properties/${propertyId}`, backendRequest, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a property
   */
  deleteProperty(propertyId: string): Observable<PropertyResponse> {
    const httpOptions = {
      headers: this.createHeaders()
    };

    return this.http.delete<PropertyResponse>(`${this.apiUrl}/landlord/properties/${propertyId}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  // ============ HELPER METHODS ============

  /**
   * Create HTTP headers with authentication
   */
  private createHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'You are not authorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Property not found or service unavailable.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Property already exists.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Invalid property data provided.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    
    console.error('Property Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  // ============ UTILITY METHODS ============

  /**
   * Validate property data before sending to backend
   */
  validatePropertyData(property: PropertyRequest): string[] {
    const errors: string[] = [];

    if (!property.name?.trim()) {
      errors.push('Property name is required');
    }

    if (!property.location?.trim()) {
      errors.push('Location is required');
    }

    if (!property.propertyType) {
      errors.push('Property type is required');
    }

    if (!property.totalUnits || property.totalUnits < 1) {
      errors.push('Total units must be at least 1');
    }

    return errors;
  }

  /**
   * Get property type display name
   */
  getPropertyTypeLabel(propertyType: string): string {
    const typeMap: { [key: string]: string } = {
      'APARTMENT': 'Apartment',
      'HOUSE': 'House',
      'bungallow': 'Bungalow',
      'COMMERCIAL': 'Commercial',
      'CONDO': 'Condominium',
      'TOWNHOUSE': 'Townhouse'
    };

    return typeMap[propertyType] || propertyType;
  }

  /**
   * Check if user has permission to manage properties
   */
  canManageProperties(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'LANDLORD' || user?.role === 'ADMIN' || user?.role === 'PROPERTY_MANAGER';
  }
}