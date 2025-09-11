// src/app/services/auth.service.ts

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { 
  User, 
  LoginRequest, 
  RegisterRequest,
  AdminAuthResponse,
  UserAuthResponse,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  UserRole
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
  
  // Reactive state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only initialize auth state if we're in the browser
    if (this.isBrowser) {
      this.initializeAuthState();
    }
  }

  // ============ STORAGE HELPER METHODS ============

  private getFromStorage(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Storage access error:', error);
      return null;
    }
  }

  private setInStorage(key: string, value: string, permanent: boolean = false): void {
    if (!this.isBrowser) return;
    try {
      const storage = permanent ? localStorage : sessionStorage;
      storage.setItem(key, value);
    } catch (error) {
      console.warn('Storage write error:', error);
    }
  }

  private removeFromStorage(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Storage remove error:', error);
    }
  }

  private clearAllStorage(): void {
    if (!this.isBrowser) return;
    try {
      const authKeys = ['authToken', 'refreshToken', 'userData'];
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  }

  // ============ AUTHENTICATION METHODS ============

  login(credentials: LoginRequest): Observable<AdminAuthResponse | UserAuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<AdminAuthResponse | UserAuthResponse>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }, httpOptions).pipe(
      tap(response => this.handleAuthSuccess(response, credentials.rememberMe)),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}/signup`, userData, httpOptions)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            if (response.token && userData.role === UserRole.ADMIN) {
              const adminResponse: AdminAuthResponse = {
                token: response.token,
                user: response.user,
                message: response.message
              };
              this.handleAuthSuccess(adminResponse, false);
            } else {
              const userResponse: UserAuthResponse = {
                user: response.user,
                message: response.message || 'Registration successful',
                success: true
              };
              this.handleAuthSuccess(userResponse, false);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logoutAdmin(): Observable<any> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Admin logout not available for non-admin users'));
    }

    const httpOptions = {
      headers: this.createAuthHeaders()
    };

    return this.http.post(`${this.apiUrl}/logout`, {}, httpOptions)
      .pipe(
        tap(() => this.handleLogout()),
        catchError(() => {
          this.handleLogout();
          return throwError(() => new Error('Logout completed locally'));
        })
      );
  }

  logoutLocal(): void {
    this.handleLogout();
  }

  refreshToken(): Observable<AdminAuthResponse> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Token refresh not available for non-admin users'));
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<AdminAuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }, httpOptions)
      .pipe(
        tap(response => this.handleAuthSuccess(response, this.isRemembered())),
        catchError(error => {
          this.handleLogout();
          return this.handleError(error);
        })
      );
  }

  // ============ PASSWORD MANAGEMENT ============

  requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(`${this.apiUrl}/forgot-password`, request, httpOptions)
      .pipe(catchError(this.handleError));
  }

  resetPassword(request: PasswordResetConfirm): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(`${this.apiUrl}/reset-password`, request, httpOptions)
      .pipe(catchError(this.handleError));
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    const httpOptions = {
      headers: this.isAdmin() ? this.createAuthHeaders() : this.createBasicHeaders()
    };
    
    return this.http.put(`${this.apiUrl}/change-password`, request, httpOptions)
      .pipe(catchError(this.handleError));
  }

  // ============ USER PROFILE METHODS ============

  getUserProfile(): Observable<User> {
    const httpOptions = {
      headers: this.isAdmin() ? this.createAuthHeaders() : this.createBasicHeaders()
    };
    
    return this.http.get<User>(`${this.apiUrl}/profile`, httpOptions)
      .pipe(
        tap(user => {
          this.updateStoredUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const httpOptions = {
      headers: this.isAdmin() ? this.createAuthHeaders() : this.createBasicHeaders()
    };
    
    return this.http.put<User>(`${this.apiUrl}/profile`, userData, httpOptions)
      .pipe(
        tap(user => {
          this.updateStoredUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  // ============ TOKEN MANAGEMENT ============

  getToken(): string | null {
    if (!this.isAdmin()) return null;
    return this.getFromStorage('authToken');
  }

  getRefreshToken(): string | null {
    if (!this.isAdmin()) return null;
    return this.getFromStorage('refreshToken');
  }

  getCurrentUser(): User | null {
    const userData = this.getFromStorage('userData');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error parsing user data:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === UserRole.ADMIN) {
      return this.hasValidToken();
    }
    
    return true;
  }

  isRemembered(): boolean {
    if (!this.isBrowser) return false;
    try {
      return !!localStorage.getItem('userData');
    } catch (error) {
      return false;
    }
  }

  // ============ HEADER CREATION METHODS ============

  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return this.createBasicHeaders();
  }

  private createBasicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAuthHeaders(): HttpHeaders {
    return this.createAuthHeaders();
  }

  // ============ UTILITY METHODS ============

  redirectToLogin(): void {
    if (this.isBrowser) {
      this.router.navigate(['/login']);
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === role.toUpperCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.role) return false;
    
    return roles.some(role => 
      user.role?.toUpperCase() === role.toUpperCase()
    );
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isTenant(): boolean {
    return this.hasRole(UserRole.TENANT);
  }

  isLandlord(): boolean {
    return this.hasRole(UserRole.LANDLORD);
  }

  // ============ PRIVATE HELPER METHODS ============

  private handleAuthSuccess(response: AdminAuthResponse | UserAuthResponse, rememberMe: boolean = false): void {
    if (!this.isBrowser) return;
    
    if ('token' in response && response.token) {
      this.setInStorage('authToken', response.token, rememberMe);
      if ('refreshToken' in response && response.refreshToken) {
        this.setInStorage('refreshToken', response.refreshToken, rememberMe);
      }
    }
    
    this.setInStorage('userData', JSON.stringify(response.user), rememberMe);
    
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private handleLogout(): void {
    if (!this.isBrowser) return;
    
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.redirectToLogin();
  }

  private hasValidToken(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.warn('Token validation error:', error);
      return false;
    }
  }

  private checkAuthenticationStatus(): boolean {
    if (!this.isBrowser) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === UserRole.ADMIN) {
      return this.hasValidToken();
    }
    
    return true;
  }

  private initializeAuthState(): void {
    if (!this.isBrowser) return;
    
    const user = this.getCurrentUser();
    const isAuthenticated = this.checkAuthenticationStatus();
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
    
    if (user && user.role === UserRole.ADMIN && !this.hasValidToken()) {
      this.handleLogout();
    }
  }

  private updateStoredUser(user: User): void {
    if (!this.isBrowser) return;
    
    const isPermanent = this.isRemembered();
    this.setInStorage('userData', JSON.stringify(user), isPermanent);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = error.error?.message || 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'User already exists';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    
    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}