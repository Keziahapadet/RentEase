
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

  private readonly apiUrl = 'https://rentease-nch9.onrender.com/api/auth';

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
    const keys = ['authToken', 'refreshToken', 'userData'];
    keys.forEach(key => this.removeFromStorage(key));
  }

  clearCorruptedStorage(): void {
    console.log('Clearing corrupted storage...');
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
    return this.http.post<RegisterResponse>(`${this.apiUrl}/signup`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(res => {
        if (res.success && res.user) {
    
          const authResponse: AuthResponse = {
            token: res.token || '',
            tokenType: 'Bearer',
            userId: Number(res.user.id),
            fullName: res.user.fullName,
            email: res.user.email,
            role: res.user.role,
            verified: res.user.verified || false,
            message: res.message
          };
          this.handleAuthSuccess(authResponse, false);
        }
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
  requestPasswordReset(request: PasswordResetRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/forgot-password`,
      request,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
  sendOtp(request: OtpRequest): Observable<OtpResponse> {
    console.log('=== SEND OTP DEBUG ===');
    console.log('Request:', JSON.stringify(request, null, 2));
    console.log('URL:', `${this.apiUrl}/send-otp`);


    const cleanRequest = {
      email: request.email.trim().toLowerCase(),
      type: request.type
    };

    console.log('Clean request:', JSON.stringify(cleanRequest, null, 2));
    console.log('======================');

    return this.http.post<OtpResponse>(`${this.apiUrl}/send-otp`, cleanRequest, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        console.log('=== SEND OTP SUCCESS ===');
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('========================');
      }),
      catchError(error => {
        console.error('=== SEND OTP ERROR ===');
        console.error('Error:', error);
        console.error('======================');
        return this.handleError(error);
      })
    );
  }

  verifyOtp(request: OtpVerifyRequest): Observable<OtpResponse> {
    console.log('=== VERIFY OTP DEBUG ===');
    console.log('Original request:', JSON.stringify(request, null, 2));
    console.log('URL:', `${this.apiUrl}/verify-otp`);

    const cleanedEmail = request.email.trim().toLowerCase();
    const cleanedOtp = request.otpCode.toString().trim().toUpperCase();

    
    const requestVariations = [
      {
        email: cleanedEmail,
        otpCode: cleanedOtp,
        type: request.type
      },
      {
        email: cleanedEmail,
        otp: cleanedOtp,
        type: request.type
      },
      {
        email: cleanedEmail,
        code: cleanedOtp,
        type: request.type
      }
    ];

    console.log('Clean email:', cleanedEmail);
    console.log('Clean OTP:', cleanedOtp);
    console.log('OTP length:', cleanedOtp.length);
    console.log('Primary request:', JSON.stringify(requestVariations[0], null, 2));
    console.log('=========================');

    return this.http.post<OtpResponse>(`${this.apiUrl}/verify-otp`, requestVariations[0], {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        console.log('=== VERIFY OTP SUCCESS ===');
        console.log('Response:', JSON.stringify(response, null, 2));
        
       
        
        if (response.success && response.user && response.token) {
          console.log('Updating auth state with verified user');
          const authResponse: AuthResponse = {
            token: response.token,
            tokenType: 'Bearer',
            userId: Number(response.user.id),
            fullName: response.user.fullName,
            email: response.user.email,
            role: response.user.role,
            verified: true,
            message: response.message
          };
          this.handleAuthSuccess(authResponse, false);
        }
        console.log('==============================');
      }),
      catchError(error => {
        console.error('=== VERIFY OTP ERROR ===');
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        console.error('Full error:', error);
        console.error('========================');

        if ((error.status === 400 || error.status === 401) && requestVariations.length > 1) {
          console.warn('Primary format failed, trying alternative formats...');
          return this.tryAlternativeOtpFormats(requestVariations.slice(1));
        }

        return this.handleOtpError(error);
      })
    );
  }

 
  
  private tryAlternativeOtpFormats(alternatives: any[]): Observable<OtpResponse> {
    if (alternatives.length === 0) {
      return throwError(() => new Error('All OTP format variations failed'));
    }

    const currentFormat = alternatives[0];
    const remainingFormats = alternatives.slice(1);

    console.log('Trying alternative format:', JSON.stringify(currentFormat, null, 2));

    return this.http.post<OtpResponse>(`${this.apiUrl}/verify-otp`, currentFormat, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        console.log('Alternative format succeeded!');
        console.log('Response:', JSON.stringify(response, null, 2));

        if (response.success && response.user && response.token) {
          const authResponse: AuthResponse = {
            token: response.token,
            tokenType: 'Bearer',
            userId: Number(response.user.id),
            fullName: response.user.fullName,
            email: response.user.email,
            role: response.user.role,
            verified: true,
            message: response.message
          };
          this.handleAuthSuccess(authResponse, false);
        }
      }),
      catchError(error => {
        console.warn('Alternative format failed:', JSON.stringify(currentFormat, null, 2));
        
        if (remainingFormats.length > 0) {
          return this.tryAlternativeOtpFormats(remainingFormats);
        } else {
          return this.handleOtpError(error);
        }
      })
    );
  }

  resendOtp(request: OtpRequest): Observable<OtpResponse> {
    console.log('Resending OTP...');
    return this.sendOtp(request);
  }

 
  
  getToken(): string | null {
    return this.getFromStorage('authToken');
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


  private handleAuthSuccess(response: AuthResponse | RegisterResponse, rememberMe: boolean = false): void {
    if (!this.isBrowser) return;

    let user: User | null = null;
    
    if ('userId' in response) { 
   
      
      this.setInStorage('authToken', response.token, rememberMe);
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
      if ('token' in response && response.token) {
        this.setInStorage('authToken', response.token, rememberMe);
      }
    }

    if (user) {
      this.setInStorage('userData', JSON.stringify(user), rememberMe);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      console.log('Auth state updated successfully:', user);
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Math.floor(Date.now() / 1000);
      if (!isValid) {
        console.log('Token expired, clearing storage');
        this.clearAllStorage();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
      return isValid;
    } catch {
      console.error('Invalid token format');
      return false;
    }
  }

  private initializeAuthState(): void {
    const user = this.getCurrentUser();
    const isAuthenticated = this.hasValidToken();
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
    console.log('Auth state initialized:', { user: user?.email, isAuthenticated });
  }
  private handleOtpError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'OTP verification failed';

    console.error('OTP Error details:', error);

    if (error.status === 400) {
      message = 'Invalid OTP format or data. Please check your code.';
    } else if (error.status === 401) {
      message = 'Invalid or expired OTP code. Please try again or request a new code.';
    } else if (error.status === 422) {
      message = error.error?.message || 'Invalid OTP data format.';
    } else if (error.status === 429) {
      message = 'Too many attempts. Please wait before trying again.';
    } else if (error.status >= 500) {
      message = 'Server error during OTP verification. Please try again.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => new Error(message));
  };

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.error?.message) {
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

    console.error('AuthService Error:', error);
    return throwError(() => new Error(message));
  };


  getDebugInfo(): any {
    return {
      apiUrl: this.apiUrl,
      currentUser: this.getCurrentUser(),
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!this.getToken(),
      timestamp: new Date().toISOString()
    };
  }
}