import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Make sure to import AuthService

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

export interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'submitted' | 'in-progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  tenantName: string;
  property: string;
}

export interface Inspection {
  id: string;
  type: 'move-in' | 'move-out' | 'routine';
  property: string;
  tenantName: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  depositAmount: number;
}

export interface DepositCase {
  id: string;
  tenantName: string;
  property: string;
  depositAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  damageAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CaretakerService {
  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Add AuthService to constructor
  ) {}

  // Create proper headers with authentication
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

  // Authentication
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Property methods
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/caretaker/properties`, {
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

  inviteTenant(tenantEmail: string, unitId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/caretaker/invite-tenant`, { 
      tenantEmail, 
      unitId 
    }, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Maintenance methods
  getMaintenanceRequests(): Observable<MaintenanceRequest[]> {
    return this.http.get<MaintenanceRequest[]>(`${this.apiUrl}/caretaker/maintenance`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateMaintenanceStatus(requestId: string, status: string): Observable<MaintenanceRequest> {
    return this.http.put<MaintenanceRequest>(
      `${this.apiUrl}/caretaker/maintenance/${requestId}`, 
      { status }, 
      {
        headers: this.createHeaders()
      }
    ).pipe(catchError(this.handleError));
  }

  // Inspection methods
  getInspections(): Observable<Inspection[]> {
    return this.http.get<Inspection[]>(`${this.apiUrl}/caretaker/inspections`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  completeInspection(inspectionId: string): Observable<Inspection> {
    return this.http.put<Inspection>(
      `${this.apiUrl}/caretaker/inspections/${inspectionId}/complete`, 
      {}, 
      {
        headers: this.createHeaders()
      }
    ).pipe(catchError(this.handleError));
  }

  // Deposit methods
  getDepositCases(): Observable<DepositCase[]> {
    return this.http.get<DepositCase[]>(`${this.apiUrl}/caretaker/deposits`, {
      headers: this.createHeaders()
    }).pipe(catchError(this.handleError));
  }

  approveDeposit(depositId: string): Observable<DepositCase> {
    return this.http.put<DepositCase>(
      `${this.apiUrl}/caretaker/deposits/${depositId}/approve`, 
      {}, 
      {
        headers: this.createHeaders()
      }
    ).pipe(catchError(this.handleError));
  }

  rejectDeposit(depositId: string): Observable<DepositCase> {
    return this.http.put<DepositCase>(
      `${this.apiUrl}/caretaker/deposits/${depositId}/reject`, 
      {}, 
      {
        headers: this.createHeaders()
      }
    ).pipe(catchError(this.handleError));
  }
}