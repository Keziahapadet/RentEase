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
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ApiResponse,
  VerifyPasswordResetOtpRequest,
  UpdatePhoneRequest
} from './auth-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) this.initializeAuthState();
  }

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
    const keys = ['authToken', 'refreshToken', 'userData', 'profileImage'];
    keys.forEach(key => this.removeFromStorage(key));
  }

  clearCorruptedStorage(): void {
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => this.handleAuthSuccess(res, credentials.rememberMe)),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    const normalizedData = {
      ...userData,
      email: userData.email.trim().toLowerCase()
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}/signup`, normalizedData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => {
        if (res.success && res.user) {
          const tempUser = {
            ...res.user,
            verified: false,
            emailVerified: false
          };
          if (this.isBrowser) {
            sessionStorage.setItem('pendingUser', JSON.stringify(tempUser));
            sessionStorage.setItem('pendingEmail', normalizedData.email);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  requestPasswordReset(request: ForgotPasswordRequest): Observable<ApiResponse> {
    const normalizedRequest = { email: request.email.trim().toLowerCase() };
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/forgot-password`,
      normalizedRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  verifyPasswordResetOtp(request: VerifyPasswordResetOtpRequest): Observable<ApiResponse> {
    const normalizedRequest = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode.toString().trim()
    };
    
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/verify-reset-otp`,
      normalizedRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handlePasswordResetError));
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse> {
    const normalizedRequest = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode.toString().trim(),
      newPassword: request.newPassword,
    };
    
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/reset-password`,
      normalizedRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/change-password`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updatePhoneNumber(request: UpdatePhoneRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/update-phone`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && this.isBrowser) {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser = { 
              ...currentUser, 
              phoneNumber: request.newPhoneNumber 
            };
            const isPermanent = !!localStorage.getItem('userData');
            this.setInStorage('userData', JSON.stringify(updatedUser), isPermanent);
            this.currentUserSubject.next(updatedUser);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  sendOtp(request: OtpRequest): Observable<OtpResponse> {
    const cleanRequest = { email: request.email.trim().toLowerCase(), type: request.type };
    return this.http.post<OtpResponse>(`${this.apiUrl}/send-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(err => this.handleError(err)));
  }

  verifyOtp(request: OtpVerifyRequest): Observable<OtpResponse> {
    const cleanRequest = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode.toString().trim().toUpperCase(),
      type: request.type
    };
    return this.http.post<OtpResponse>(`${this.apiUrl}/verify-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.handleAuthSuccess({
            token: res.token,
            tokenType: 'Bearer',
            userId: res.user?.id as number || 0,
            fullName: res.user?.fullName || '',
            email: res.user?.email || '',
            role: res.user?.role || UserRole.TENANT,
            verified: res.user?.verified || false,
            user: res.user
          }, false);
        }
      }),
      catchError(err => this.handleOtpError(err))
    );
  }

  resendOtp(request: OtpRequest): Observable<OtpResponse> {
    const cleanRequest = { email: request.email.trim().toLowerCase(), type: request.type };
    return this.http.post<OtpResponse>(`${this.apiUrl}/resend-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(err => this.handleError(err)));
  }

  getToken(): string | null {
    const token = this.getFromStorage('authToken');
    if (!token) return null;
    
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    if (cleanToken.startsWith("'") && cleanToken.endsWith("'")) {
      cleanToken = cleanToken.slice(1, -1);
    }
    if (cleanToken.startsWith('Bearer ')) {
      cleanToken = cleanToken.substring(7).trim();
    }
    
    return cleanToken;
  }

  getCurrentUser(): User | null {
    const userData = this.getFromStorage('userData');
    if (!userData) return null;
    try { 
      return JSON.parse(userData); 
    } catch { 
      this.removeFromStorage('userData'); 
      return null; 
    }
  }

  isAuthenticated(): boolean { 
    return this.hasValidToken();
  }

  getAuthHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = this.getToken();
    
    if (!token) {
      return new HttpHeaders(
        includeContentType ? { 'Content-Type': 'application/json' } : {}
      );
    }

    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return new HttpHeaders(headers);
  }

  hasRole(role: UserRole | string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === role.toUpperCase();
  }

  isBusiness(): boolean { return this.hasRole(UserRole.BUSINESS); }
  isTenant(): boolean { return this.hasRole(UserRole.TENANT); }
  isLandlord(): boolean { return this.hasRole(UserRole.LANDLORD); }
  isCaretaker(): boolean { return this.hasRole(UserRole.CARETAKER); }
  isAdmin(): boolean { return this.hasRole(UserRole.ADMIN); }

  needsEmailVerification(): boolean {
    const user = this.getCurrentUser();
    return !!(user && !user.emailVerified);
  }

  getPendingEmail(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem('pendingEmail');
  }

  clearPendingVerification(): void {
    if (!this.isBrowser) return;
    sessionStorage.removeItem('pendingUser');
    sessionStorage.removeItem('pendingEmail');
  }

  private handleAuthSuccess(response: AuthResponse | RegisterResponse, rememberMe: boolean = false): void {
    if (!this.isBrowser) return;
    
    let user: User | null = null;
    let token: string | null = null;

    if ('userId' in response) {
      token = response.token;
      user = {
        id: response.userId.toString(),
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        verified: response.verified,
        emailVerified: response.verified
      };
    } else if ('user' in response && response.user) {
      user = response.user;
      token = ('token' in response && response.token) ? response.token : null;
    }

    if (token) {
      let cleanToken = token.trim();
      if (cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.substring(7).trim();
      }
      this.setInStorage('authToken', cleanToken, rememberMe);
    }

    if (user) {
      this.setInStorage('userData', JSON.stringify(user), rememberMe);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      if (user.verified || user.emailVerified) {
        this.clearPendingVerification();
      }
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = tokenParts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decodedPayload = atob(paddedBase64);
      const payloadObj = JSON.parse(decodedPayload);
      
      if (!payloadObj.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payloadObj.exp > currentTime;
      
    } catch {
      return false;
    }
  }

  private initializeAuthState(): void {
    const user = this.getCurrentUser();
    const token = this.getToken();
    
    let isAuthenticated = false;
    
    if (user && token) {
      isAuthenticated = this.hasValidToken();
      
      if (!isAuthenticated) {
        this.clearAllStorage();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return;
      }
    } else {
      if (user && !token) {
        this.clearAllStorage();
      }
      isAuthenticated = false;
    }
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private handlePasswordResetError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'Password reset verification failed';
    
    if (error.status === 400) {
      message = error.error?.message || 'Invalid OTP format or data.';
    } else if (error.status === 401) {
      message = error.error?.message || 'Invalid or expired OTP code.';
    } else if (error.status === 404) {
      message = 'OTP not found or has expired. Please request a new one.';
    } else if (error.status === 422) {
      message = error.error?.message || 'Invalid OTP data format.';
    } else if (error.status === 429) {
      message = 'Too many verification attempts. Please wait before trying again.';
    } else if (error.status >= 500) {
      message = 'Server error during OTP verification. Please try again later.';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    
    return throwError(() => new Error(message));
  };

  private handleOtpError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'OTP operation failed';
    if (error.status === 400) message = error.error?.message || 'Invalid OTP format or data.';
    else if (error.status === 401) message = error.error?.message || 'Invalid or expired OTP code.';
    else if (error.status === 404) message = 'OTP not found. Please request a new code.';
    else if (error.status === 422) message = error.error?.message || 'Invalid OTP data format.';
    else if (error.status === 429) message = 'Too many attempts. Please wait.';
    else if (error.status >= 500) message = 'Server error during OTP operation.';
    else if (error.error?.message) message = error.error.message;
    
    return throwError(() => new Error(message));
  };

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 401) {
        message = 'Invalid credentials or session expired';
      } else if (error.status === 403) {
        message = 'Access denied';
      } else if (error.status === 409) {
        message = 'Account already exists with this email';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }
    }
    
    return throwError(() => new Error(message));
  };
}