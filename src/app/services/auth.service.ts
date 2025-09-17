// src/app/services/auth.service.ts

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
  User,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserRole,
  AuthResponse,
  OtpRequest,
  OtpVerifyRequest,
  OtpResponse,
  PasswordResetRequest
} from './auth-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private readonly apiUrl = 'http://10.20.33.70:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) this.initializeAuthState();
  }

  // ================= STORAGE HELPERS =================
  private getFromStorage(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (value === 'undefined' || value === 'null') return null;
      return value;
    } catch {
      return null;
    }
  }

  private setInStorage(key: string, value: string, permanent: boolean = false): void {
    if (!this.isBrowser) return;
    try {
      const storage = permanent ? localStorage : sessionStorage;
      storage.setItem(key, value);
    } catch {}
  }

  private removeFromStorage(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  }

  private clearAllStorage(): void {
    if (!this.isBrowser) return;
    const keys = ['authToken', 'refreshToken', 'userData'];
    keys.forEach(key => this.removeFromStorage(key));
  }

  clearCorruptedStorage(): void {
    console.log('Clearing corrupted storage...');
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // ================= AUTH METHODS =================
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => this.handleAuthSuccess(res, credentials.rememberMe)),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/signup`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => {
        if (res.success && res.user) this.handleAuthSuccess({ ...res, user: res.user }, false);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  // ================= PASSWORD RESET =================
  requestPasswordReset(request: PasswordResetRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/forgot-password`,
      request,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  // ================= OTP METHODS =================
  sendOtp(request: OtpRequest): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/send-otp`, request, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }

  verifyOtp(request: OtpVerifyRequest): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/verify-otp`, request, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }

  resendOtp(request: OtpRequest): Observable<OtpResponse> {
    return this.sendOtp(request);
  }

  // ================= TOKEN & USER HELPERS =================
  getToken(): string | null {
    return this.getFromStorage('authToken');
  }

  getCurrentUser(): User | null {
    const userData = this.getFromStorage('userData');
    if (!userData) return null;
    try { return JSON.parse(userData); } 
    catch { this.removeFromStorage('userData'); return null; }
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  hasRole(role: UserRole | string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === role.toUpperCase();
  }

  isBusiness(): boolean { return this.hasRole(UserRole.BUSINESS); }
  isTenant(): boolean { return this.hasRole(UserRole.TENANT); }
  isLandlord(): boolean { return this.hasRole(UserRole.LANDLORD); }
  isCaretaker(): boolean { return this.hasRole(UserRole.CARETAKER); }

  // ================= PRIVATE HELPERS =================
  private handleAuthSuccess(response: AuthResponse | RegisterResponse, rememberMe: boolean = false): void {
    if (!this.isBrowser) return;

    let user: User | null = null;
    if ('userId' in response) { // AuthResponse
      this.setInStorage('authToken', response.token, rememberMe);
      user = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        verified: response.verified
      };
    } else if ('user' in response && response.user) { // RegisterResponse
      user = response.user;
      if ('token' in response && response.token) this.setInStorage('authToken', response.token, rememberMe);
    }

    if (user) {
      this.setInStorage('userData', JSON.stringify(user), rememberMe);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  private initializeAuthState(): void {
    const user = this.getCurrentUser();
    const isAuthenticated = this.hasValidToken();
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) message = error.error.message;
    else message = error.error?.message || message;

    console.error('AuthService Error:', error);
    return throwError(() => new Error(message));
  };
}
