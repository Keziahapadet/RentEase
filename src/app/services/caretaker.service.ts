import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Property {
  id: number;
  name: string;
  address: string;
  units: Unit[];
}

export interface Unit {
  id: number;
  unitNumber: string;
  unitType: string;
  description: string;
  rentAmount: number;
  deposit: number;
  isOccupied: boolean;
  propertyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CaretakerService {
  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headersConfig: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headersConfig);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Service temporarily unavailable';
    
    if (error.status === 401) {
      errorMessage = 'Please check your authentication';
    } else if (error.status === 404) {
      errorMessage = 'Feature not available yet';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    console.warn('Caretaker service error handled:', errorMessage);
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/caretaker/properties`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  getPropertyDetails(propertyId: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/caretaker/properties/${propertyId}`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  getPropertyUnits(propertyId: number): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.apiUrl}/caretaker/properties/${propertyId}/units`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  createUnit(propertyId: number, unit: Omit<Unit, 'id'>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}/caretaker/properties/${propertyId}/units`, unit, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  getAllUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.apiUrl}/caretaker/units`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  inviteTenant(tenantEmail: string, unitId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/caretaker/invite-tenant`, { 
      tenantEmail, 
      unitId 
    }, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }
}