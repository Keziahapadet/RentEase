import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

export interface ProfilePictureResponse {
  success: boolean;
  message: string;
  imageUrl?: string;
  pictureUrl?: string;
  data?: string;
}

export interface UploadPictureRequest {
  file: string; // Base64 encoded string
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'caretaker' | 'tenant' | 'landlord' | 'admin' | 'business' | 'user';
  profilePicture?: string;
  verified: boolean;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfilePictureService {
  private readonly apiUrl = 'https://rentease-3-sfgx.onrender.com/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCurrentUserProfile(): Observable<UserProfile> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No user data found' 
      }));
    }

    const userProfile: UserProfile = {
      id: currentUser.id,
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role,
      profilePicture: currentUser.profilePicture,
      verified: currentUser.verified,
      emailVerified: currentUser.emailVerified
    };

    return of(userProfile);
  }

  getProfilePicture(): Observable<ProfilePictureResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return of({
        success: false,
        pictureUrl: this.getDefaultAvatar(),
        message: 'No token available'
      });
    }

    return this.http.get<ProfilePictureResponse>(
      `${this.apiUrl}/profile/picture`,
      { headers: this.createHeaders() }
    ).pipe(
      map(response => this.normalizeResponse(response)),
      tap(response => {
        const pictureUrl = this.extractImageUrl(response);
        if (response.success && pictureUrl) {
          localStorage.setItem('profileImage', pictureUrl);
          
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              profilePicture: pictureUrl
            };
            this.updateLocalUserData(updatedUser);
          }
        }
      }),
      catchError(() => {
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
          pictureUrl: this.getDefaultAvatar(),
          message: 'Using default avatar'
        });
      })
    );
  }

  uploadProfilePicture(file: File): Observable<ProfilePictureResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    // Convert file to base64 string
    return this.fileToBase64(file).pipe(
      map(base64String => {
        const uploadRequest: UploadPictureRequest = {
          file: base64String
        };
        return uploadRequest;
      }),
      catchError(error => throwError(() => ({ 
        status: 400, 
        message: 'Failed to convert image to base64' 
      }))),
      switchMap(uploadRequest => 
        this.http.post<ProfilePictureResponse>(
          `${this.apiUrl}/profile/upload-picture`,
          uploadRequest,
          { headers: this.createHeaders() }
        ).pipe(
          map(response => this.normalizeResponse(response)),
          tap(response => {
            const pictureUrl = this.extractImageUrl(response);
            if (response.success && pictureUrl) {
              localStorage.removeItem('profileImage');
              localStorage.setItem('profileImage', pictureUrl);
              
              const currentUser = this.authService.getCurrentUser();
              if (currentUser) {
                const updatedUser = {
                  ...currentUser,
                  profilePicture: pictureUrl
                };
                this.updateLocalUserData(updatedUser);
              }
            }
          }),
          catchError(this.handleProfileError)
        )
      )
    );
  }

  updateProfilePicture(file: File): Observable<ProfilePictureResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    // Convert file to base64 string
    return this.fileToBase64(file).pipe(
      map(base64String => {
        const updateRequest: UploadPictureRequest = {
          file: base64String
        };
        return updateRequest;
      }),
      catchError(error => throwError(() => ({ 
        status: 400, 
        message: 'Failed to convert image to base64' 
      }))),
      switchMap(updateRequest => 
        this.http.put<ProfilePictureResponse>(
          `${this.apiUrl}/profile/update-picture`,
          updateRequest,
          { headers: this.createHeaders() }
        ).pipe(
          map(response => this.normalizeResponse(response)),
          tap(response => {
            const pictureUrl = this.extractImageUrl(response);
            if (response.success && pictureUrl) {
              localStorage.removeItem('profileImage');
              localStorage.setItem('profileImage', pictureUrl);
              
              const currentUser = this.authService.getCurrentUser();
              if (currentUser) {
                const updatedUser = {
                  ...currentUser,
                  profilePicture: pictureUrl
                };
                this.updateLocalUserData(updatedUser);
              }
            }
          }),
          catchError(this.handleProfileError)
        )
      )
    );
  }

  deleteProfilePicture(): Observable<ProfilePictureResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => ({ 
        status: 401, 
        message: 'No authentication token found' 
      }));
    }

    return this.http.delete<ProfilePictureResponse>(
      `${this.apiUrl}/profile/delete-picture`,
      { headers: this.createHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          localStorage.removeItem('profileImage');
          
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              profilePicture: undefined
            };
            this.updateLocalUserData(updatedUser);
          }
        }
      }),
      catchError(this.handleProfileError)
    );
  }

  // Helper method to convert File to base64 string
  private fileToBase64(file: File): Observable<string> {
    return new Observable<string>(observer => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.includes('base64,') 
          ? base64String.split('base64,')[1] 
          : base64String;
        observer.next(base64Data);
        observer.complete();
      };
      
      reader.onerror = error => {
        observer.error(error);
      };
      
      reader.readAsDataURL(file);
    });
  }

  private normalizeResponse(response: ProfilePictureResponse): ProfilePictureResponse {
    const imageUrl = this.extractImageUrl(response);
    return {
      ...response,
      pictureUrl: imageUrl,
      imageUrl: imageUrl
    };
  }

  private extractImageUrl(response: ProfilePictureResponse): string | undefined {
    return response.data || response.imageUrl || response.pictureUrl;
  }

  getDefaultAvatar(name?: string): string {
    const currentUser = this.authService.getCurrentUser();
    const userName = name || currentUser?.fullName || 'User';
    const role = currentUser?.role || 'user';
    const names = userName.split(' ');
    const initials = names.map((n: string) => n.charAt(0).toUpperCase()).join('').slice(0, 2) || 'US';
    
    const colors = {
      caretaker: '#FF6B6B',
      tenant: '#4ECDC4', 
      landlord: '#45B7D1',
      admin: '#43e97b',
      business: '#fa709a',
      user: '#96CEB4'
    };
    
    const color = colors[role as keyof typeof colors] || '#96CEB4';
    
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

  private handleProfileError = (error: any): Observable<never> => {
    let errorMessage = 'Profile picture operation failed';
    
    if (error.status === 500) {
      errorMessage = 'Server error - profile picture feature temporarily unavailable';
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed';
      this.authService.logout().subscribe();
    } else if (error.status === 413) {
      errorMessage = 'Image file is too large';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported image format';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };

  private updateLocalUserData(user: any): void {
    const isPermanent = !!localStorage.getItem('userData');
    const storage = isPermanent ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(user));
   
    if ((this.authService as any).currentUserSubject) {
      (this.authService as any).currentUserSubject.next(user);
    }
  }
}