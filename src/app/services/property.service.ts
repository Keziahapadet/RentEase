import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { 
  PropertyRequest, 
  PropertyResponse, 
  Property, 
  Unit,
  ProfilePictureResponse
} from './dashboard-interface';
import { ApiResponse, User } from './auth-interfaces';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCurrentUserProfile(): Observable<ApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No user data found' 
      }));
    }

    return of({
      success: true,
      message: 'Using local user data',
      user: currentUser
    } as ApiResponse);
  }

  updateUserProfile(profileData: any): Observable<ApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No user data found' 
      }));
    }

    const updatedUser = {
      ...currentUser,
      ...profileData,
      id: currentUser.id,
      role: currentUser.role,
      verified: currentUser.verified,
      emailVerified: currentUser.emailVerified
    };
    
    this.updateLocalUserData(updatedUser);
    
    return of({
      success: true,
      message: 'Profile updated locally',
      user: updatedUser
    } as ApiResponse);
  }

  getProfilePicture(): Observable<ProfilePictureResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return of({
        success: false,
        pictureUrl: this.generateDefaultAvatar(),
        message: 'No token available'
      });
    }

    const httpOptions = { 
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.get<ProfilePictureResponse>(
      `${this.apiUrl}/api/profile/picture`,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.success && response.pictureUrl) {
          localStorage.setItem('profileImage', response.pictureUrl);
        }
      }),
      catchError(error => {
        const cachedImage = localStorage.getItem('profileImage');
        if (cachedImage && !cachedImage.includes('svg+xml')) {
          return of({
            success: true,
            pictureUrl: cachedImage,
            message: 'Using cached image'
          });
        }
        return of({
          success: false,
          pictureUrl: this.generateDefaultAvatar(),
          message: 'Using default avatar'
        });
      })
    );
  }

  uploadProfilePicture(file: File): Observable<ApiResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/api/profile/upload-picture`,
      formData,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success) {
          localStorage.removeItem('profileImage');
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  updateProfilePicture(file: File): Observable<ApiResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ApiResponse>(
      `${this.apiUrl}/api/profile/update-picture`,
      formData,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success) {
          localStorage.removeItem('profileImage');
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  deleteProfilePicture(): Observable<ApiResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    const httpOptions = { 
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/api/profile/delete-picture`,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.success) {
          localStorage.removeItem('profileImage');
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  createProperty(request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: Number(request.totalUnits),
      description: request.description?.trim() || ''
    };

    return this.http.post<PropertyResponse>(
      `${this.apiUrl}/api/landlord/properties`,
      backendRequest,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  getProperties(): Observable<Property[]> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<any>(
      `${this.apiUrl}/api/landlord/properties`, 
      httpOptions
    ).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response?.properties && Array.isArray(response.properties)) {
          return response.properties;
        } else if (response?.content && Array.isArray(response.content)) {
          return response.content;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  getPropertyById(propertyId: string): Observable<Property> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<any>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}`,
      httpOptions
    ).pipe(
      map(response => {
        if (response?.data) {
          return response.data;
        } else if (response?.property) {
          return response.property;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateProperty(propertyId: string, request: PropertyRequest): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };
    const backendRequest = {
      name: request.name.trim(),
      location: request.location.trim(),
      propertyType: request.propertyType,
      totalUnits: Number(request.totalUnits),
      description: request.description?.trim() || ''
    };

    return this.http.put<PropertyResponse>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}`,
      backendRequest,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  deleteProperty(propertyId: string): Observable<PropertyResponse> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.delete<PropertyResponse>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}`,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  getUnitsByPropertyId(propertyId: string): Observable<Unit[]> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<any>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}/units`,
      httpOptions
    ).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response?.units && Array.isArray(response.units)) {
          return response.units;
        } else if (response?.content && Array.isArray(response.content)) {
          return response.content;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  getPropertyUnits(propertyId: string): Observable<Unit[]> {
    return this.getUnitsByPropertyId(propertyId);
  }

  createUnit(propertyId: string, unit: any): Observable<any> {
    const httpOptions = { headers: this.createHeaders() };
    const unitData = {
      unitNumber: unit.unitNumber.trim(),
      unitType: unit.unitType,
      rentAmount: Number(unit.rentAmount),
      deposit: Number(unit.deposit),
      description: unit.description?.trim() || ''
    };

    return this.http.post<any>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}/units`,
      unitData,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  updateUnit(propertyId: string, unitId: string, unit: Unit): Observable<Unit> {
    const httpOptions = { headers: this.createHeaders() };
    const unitData = {
      unitNumber: unit.unitNumber?.trim(),
      unitType: unit.unitType,
      rentAmount: Number(unit.rentAmount),
      deposit: Number(unit.deposit),
      description: unit.description?.trim() || ''
    };

    return this.http.put<Unit>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}/units/${unitId}`,
      unitData,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  deleteUnit(propertyId: string, unitId: string): Observable<void> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.delete<void>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}/units/${unitId}`,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  getDashboardStats(): Observable<any> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<any>(
      `${this.apiUrl}/api/landlord/dashboard/stats`,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  getPropertyStats(propertyId: string): Observable<any> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<any>(
      `${this.apiUrl}/api/landlord/properties/${propertyId}/stats`,
      httpOptions
    ).pipe(catchError(this.handleError));
  }

  private generateDefaultAvatar(): string {
    const currentUser = this.authService.getCurrentUser();
    const name = currentUser?.fullName || 'User';
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2) || 'US';
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}" rx="100"/>
        <text x="100" y="125" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleProfileError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Profile Picture Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
    
    let errorMessage = 'Profile picture operation failed';
    
    if (error.status === 500) {
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.message || 'Server error processing profile picture';
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = 'Server error - please try again later';
      }
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed';
      this.authService.logout();
    } else if (error.status === 413) {
      errorMessage = 'Image file is too large';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported image format';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication failed';
      this.authService.logout();
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };

  updateLocalUserData(user: User): void {
    const isPermanent = !!localStorage.getItem('userData');
    const storage = isPermanent ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(user));
   
    if ((this.authService as any).currentUserSubject) {
      (this.authService as any).currentUserSubject.next(user);
    }
  }

  testProfilePictureEndpoints(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token available for testing');
      return;
    }

    console.log('Testing profile picture endpoints...');
    
    this.getProfilePicture().subscribe({
      next: (response) => console.log('GET /api/profile/picture:', response),
      error: (error) => console.error('GET /api/profile/picture failed:', error)
    });
  }
}