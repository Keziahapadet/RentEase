import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { InviteTenantRequest, InviteCaretakerRequest } from '../services/invite-interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = 'https://rentease-3-sfgx.onrender.com/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

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
    let errorMessage = 'An unexpected error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication failed';
      this.authService.logout().subscribe();
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }

  inviteTenant(inviteData: InviteTenantRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/landlord/invite-tenant`, 
      inviteData,
      { 
        headers: this.createHeaders(),
        responseType: 'json'
      }
    ).pipe(catchError(this.handleError));
  }

  inviteCaretaker(inviteData: InviteCaretakerRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/landlord/invite-caretaker`, 
      inviteData,
      { 
        headers: this.createHeaders(),
        responseType: 'json'
      }
    ).pipe(catchError(this.handleError));
  }

  getAvailableUnits(propertyId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/landlord/properties/${propertyId}/units?status=vacant`,
      { 
        headers: this.createHeaders(),
        responseType: 'json'
      }
    ).pipe(catchError(this.handleError));
  }

  acceptInvitation(token: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/accept-invitation`,
      { token: token },
      { 
        headers: this.createHeaders(),
        responseType: 'json'
      }
    ).pipe(catchError(this.handleError));
  }

  getSentInvitations(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/invitations/sent`,
      { headers: this.createHeaders(), responseType: 'json' }
    ).pipe(catchError(this.handleError));
  }

  getReceivedInvitations(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/invitations/received`,
      { headers: this.createHeaders(), responseType: 'json' }
    ).pipe(catchError(this.handleError));
  }
}