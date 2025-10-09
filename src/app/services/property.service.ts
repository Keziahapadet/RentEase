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
    
    if (currentUser) {
      return of({
        success: true,
        message: 'Using local user data',
        user: currentUser
      } as ApiResponse);
    }

    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<ApiResponse>(
      `${this.apiUrl}/api/profile`,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateLocalUserData(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  updateUserProfile(profileData: any): Observable<ApiResponse> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.put<ApiResponse>(
      `${this.apiUrl}/api/profile`,
      profileData,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateLocalUserData(response.user);
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  getUserProfileById(userId: string): Observable<ApiResponse> {
    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<ApiResponse>(
      `${this.apiUrl}/api/profile/${userId}`,
      httpOptions
    ).pipe(catchError(this.handleProfileError));
  }

  getProfilePicture(): Observable<ProfilePictureResponse> {
    const cachedImage = localStorage.getItem('profileImage');
    if (cachedImage) {
      return of({
        success: true,
        pictureUrl: cachedImage,
        message: 'Using cached image'
      } as ProfilePictureResponse);
    }

    const httpOptions = { headers: this.createHeaders() };

    return this.http.get<ProfilePictureResponse>(
      `${this.apiUrl}/api/profile/picture`,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.success && response.pictureUrl) {
          localStorage.setItem('profileImage', response.pictureUrl);
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  uploadProfilePicture(file: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('picture', file);
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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
    const formData = new FormData();
    formData.append('picture', file);
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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
    const httpOptions = { headers: this.createHeaders() };

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

  private createHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  private handleProfileError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Profile operation failed';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 401:
          errorMessage = 'Unable to update profile. Please check your authentication.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Profile endpoint not found.';
          break;
        case 409:
          errorMessage = error.error?.message || 'A resource with this information already exists.';
          break;
        case 413:
          errorMessage = 'File is too large. Please try a smaller image.';
          break;
        case 415:
          errorMessage = 'Unsupported file type. Please use JPEG or PNG.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = error.error?.message || 'A resource with this information already exists.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };

  canManageProperties(): boolean {
    const userRole = this.authService.getCurrentUser()?.role || '';
    const allowedRoles = ['landlord', 'admin', 'caretaker'];
    return allowedRoles.includes(userRole.toLowerCase());
  }

  validatePropertyData(data: any): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Property name cannot be empty');
    } else if (data.name.trim().length < 2) {
      errors.push('Property name must be at least 2 characters long');
    } else if (data.name.trim().length > 100) {
      errors.push('Property name cannot exceed 100 characters');
    }

    if (!data.location || data.location.trim().length === 0) {
      errors.push('Location cannot be empty');
    } else if (data.location.trim().length < 5) {
      errors.push('Location must be at least 5 characters long');
    }

    if (!data.propertyType) {
      errors.push('Property type is required');
    }

    if (isNaN(data.totalUnits) || data.totalUnits < 1) {
      errors.push('Total units must be a number greater than 0');
    } else if (data.totalUnits > 1000) {
      errors.push('Total units cannot exceed 1000');
    }

    if (data.description && data.description.trim().length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    return errors;
  }

  validateUnitData(unit: any): string[] {
    const errors: string[] = [];

    if (!unit.unitNumber || unit.unitNumber.trim().length === 0) {
      errors.push('Unit number cannot be empty');
    } else if (unit.unitNumber.trim().length > 20) {
      errors.push('Unit number cannot exceed 20 characters');
    }

    if (!unit.unitType) {
      errors.push('Unit type is required');
    }

    if (isNaN(unit.rentAmount) || unit.rentAmount < 1) {
      errors.push('Rent amount must be a number greater than 0');
    } else if (unit.rentAmount > 1000000) {
      errors.push('Rent amount cannot exceed 1,000,000');
    }

    if (isNaN(unit.deposit) || unit.deposit < 0) {
      errors.push('Deposit must be a number greater than or equal to 0');
    } else if (unit.deposit > 1000000) {
      errors.push('Deposit cannot exceed 1,000,000');
    }

    if (unit.description && unit.description.trim().length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    return errors;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  updateLocalUserData(user: User): void {
    const isPermanent = !!localStorage.getItem('userData');
    const storage = isPermanent ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(user));
   
    if ((this.authService as any).currentUserSubject) {
      (this.authService as any).currentUserSubject.next(user);
    }
  }
}