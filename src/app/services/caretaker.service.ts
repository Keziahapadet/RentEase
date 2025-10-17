import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com';

  constructor(private http: HttpClient) {}

  // Authentication
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  // Property methods
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`);
  }

  getPropertyUnits(propertyId: number): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.apiUrl}/properties/${propertyId}/units`);
  }

  createUnit(propertyId: number, unit: Omit<Unit, 'id'>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}/properties/${propertyId}/units`, unit);
  }

  inviteTenant(tenantEmail: string, unitId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite-tenant`, { tenantEmail, unitId });
  }

  // Maintenance methods
  getMaintenanceRequests(): Observable<MaintenanceRequest[]> {
    return this.http.get<MaintenanceRequest[]>(`${this.apiUrl}/maintenance`);
  }

  updateMaintenanceStatus(requestId: string, status: string): Observable<MaintenanceRequest> {
    return this.http.put<MaintenanceRequest>(`${this.apiUrl}/maintenance/${requestId}`, { status });
  }

  // Inspection methods
  getInspections(): Observable<Inspection[]> {
    return this.http.get<Inspection[]>(`${this.apiUrl}/inspections`);
  }

  completeInspection(inspectionId: string): Observable<Inspection> {
    return this.http.put<Inspection>(`${this.apiUrl}/inspections/${inspectionId}/complete`, {});
  }

  // Deposit methods
  getDepositCases(): Observable<DepositCase[]> {
    return this.http.get<DepositCase[]>(`${this.apiUrl}/deposits`);
  }

  approveDeposit(depositId: string): Observable<DepositCase> {
    return this.http.put<DepositCase>(`${this.apiUrl}/deposits/${depositId}/approve`, {});
  }

  rejectDeposit(depositId: string): Observable<DepositCase> {
    return this.http.put<DepositCase>(`${this.apiUrl}/deposits/${depositId}/reject`, {});
  }
}