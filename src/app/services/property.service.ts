import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PropertyCreateRequest, PropertyResponse } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://localhost:8080/api/properties'; // Update with your backend URL
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Create a new property
   */
  createProperty(property: PropertyCreateRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(`${this.apiUrl}/properties`, property, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all properties
   */
  getProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/properties`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get property by ID
   */
  getProperty(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.apiUrl}/properties/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update property
   */
  updateProperty(id: string, property: PropertyCreateRequest): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/properties/${id}`, property, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete property
   */
  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400) {
        errorMessage = 'Invalid data provided. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else if (error.status === 404) {
        errorMessage = 'Property not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('PropertyService Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get property statistics
   */
  getPropertyStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/properties/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }
}