import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InviteTenantRequest, InviteCaretakerRequest } from './invite-interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = '/api/landlord';

  constructor(private http: HttpClient) {}

  inviteTenant(inviteData: InviteTenantRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite-tenant`, inviteData);
  }

  inviteCaretaker(inviteData: InviteCaretakerRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite-caretaker`, inviteData);
  }

  getAvailableUnits(propertyId: string): Observable<any> {
    return this.http.get(`/api/properties/${propertyId}/units?status=vacant`);
  }
}