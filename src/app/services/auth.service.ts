import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(null);
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

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => this.handleAuthSuccess(res, credentials.rememberMe)),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<any> {
    const normalizedData = {
      ...userData,
      email: userData.email.trim().toLowerCase()
    };

    return this.http.post<any>(`${this.apiUrl}/signup`, normalizedData, {
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

  logout(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      this.performLocalLogout();
      return of({ success: true, message: 'Logged out locally' });
    }

    return this.http.post<any>(
      `${this.apiUrl}/logout`,
      {},
      { 
        headers: this.getAuthHeaders(),
        responseType: 'json'
      }
    ).pipe(
      tap(response => {
        console.log('Backend logout successful:', response);
        this.performLocalLogout();
      }),
      catchError(error => {
        console.error('Backend logout failed, performing local logout:', error);
        this.performLocalLogout();
        return of({ 
          success: true, 
          message: 'Logged out locally (backend unavailable)' 
        });
      })
    );
  }

  private performLocalLogout(): void {
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  logoutSync(): void {
    const token = this.getToken();
    
    this.performLocalLogout();
    
    if (token) {
      this.http.post<any>(
        `${this.apiUrl}/logout`,
        {},
        { 
          headers: this.getAuthHeaders(),
          responseType: 'json'
        }
      ).subscribe({
        next: () => console.log('Backend logout completed'),
        error: (err) => console.warn('Backend logout failed:', err)
      });
    }
  }

  requestPasswordReset(request: any): Observable<any> {
    const normalizedRequest = { email: request.email.trim().toLowerCase() };
    return this.http.post<any>(
      `${this.apiUrl}/forgot-password`,
      normalizedRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  verifyPasswordResetOtp(request: any): Observable<any> {
    const normalizedRequest = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode.toString().trim()
    };
    
    return this.http.post<any>(
      `${this.apiUrl}/verify-reset-otp`,
      normalizedRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handlePasswordResetError));
  }

  resetPassword(request: any): Observable<any> {
    const payload = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode,
      newPassword: request.newPassword
    };
    
    return this.http.post<any>(
      `${this.apiUrl}/reset-password`,
      payload,
      { 
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      tap(response => {
        console.log('RESET PASSWORD SUCCESS:', response);
      }),
      catchError(error => {
        console.error('RESET PASSWORD ERROR:', error);
        return this.handleError(error);
      })
    );
  }

  changePassword(request: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/change-password`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updatePhoneNumber(request: any): Observable<any> {
    return this.http.post<any>(
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

  sendOtp(request: any): Observable<any> {
    const cleanRequest = { email: request.email.trim().toLowerCase(), type: request.type };
    return this.http.post<any>(`${this.apiUrl}/send-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }

  verifyOtp(request: any): Observable<any> {
    const cleanRequest = {
      email: request.email.trim().toLowerCase(),
      otpCode: request.otpCode.toString().trim(),
      type: request.type
    };
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => {
        if (res.success && res.token) {
          if (!res.user?.role) {
            throw new Error('User role not provided in verification response');
          }
          
          this.handleAuthSuccess({
            token: res.token,
            tokenType: 'Bearer',
            userId: res.user.id as number,
            fullName: res.user.fullName || '',
            email: res.user.email || '',
            role: res.user.role,
            verified: res.user.verified || false,
            user: res.user
          }, false);
        }
      }),
      catchError(this.handleOtpError)
    );
  }

  resendOtp(request: any): Observable<any> {
    const cleanRequest = { email: request.email.trim().toLowerCase(), type: request.type };
    return this.http.post<any>(`${this.apiUrl}/resend-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
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

  getCurrentUser(): any {
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

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
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

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === role.toUpperCase();
  }

  isBusiness(): boolean { return this.hasRole('BUSINESS'); }
  isTenant(): boolean { return this.hasRole('TENANT'); }
  isLandlord(): boolean { return this.hasRole('LANDLORD'); }
  isCaretaker(): boolean { return this.hasRole('CARETAKER'); }
  isAdmin(): boolean { return this.hasRole('ADMIN'); }

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

  private handleAuthSuccess(response: any, rememberMe: boolean = false): void {
    if (!this.isBrowser) return;
    
    let user: any = null;
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