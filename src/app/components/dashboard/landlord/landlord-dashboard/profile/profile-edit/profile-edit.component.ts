import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { PropertyService } from '../../../../../../services/property.service';
import { AuthService } from '../../../../../../services/auth.service';
import { ExtendedUser, UpdatePhoneRequest, ApiResponse, User } from '../../../../../../services/auth-interfaces';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  user: ExtendedUser | null = null;
  profileImage: string | null = null;
  profileForm: FormGroup;
  isSubmitting = false;
  isUploadingPhoto = false;
  isDeletingPhoto = false;
  isCameraActive = false;
  isLoadingUserData = false;
  stream: MediaStream | null = null;
  videoElement: HTMLVideoElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;
  
  originalPhoneNumber: string = '';

  constructor() {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.debugAuthState();
    this.loadUserDataFromApi();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private debugAuthState(): void {
    console.log('🔐 PROFILE EDIT - AUTH DEBUG:');
    console.log('Current User:', this.authService.getCurrentUser());
    console.log('Token:', this.authService.getToken());
    console.log('Is Authenticated:', this.authService.isAuthenticated());
    
    // Check if we're immediately failing
    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();
    
    if (!token) {
      console.error('❌ IMMEDIATE FAIL: No token found');
    }
    if (!user) {
      console.error('❌ IMMEDIATE FAIL: No user found');
    }
    if (!token || !user) {
      console.error('❌ Authentication failed - redirecting to login');
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }
    
    console.log('✅ Auth check passed - proceeding with API call');
  }

  private loadUserDataFromApi(): void {
    // Check if user is authenticated first
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    if (!currentUser || !token) {
      console.error('❌ No user or token found, redirecting to login');
      this.snackBar.open('Please log in to continue', 'Close', { 
        duration: 3000 
      });
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoadingUserData = true;

    this.propertyService.getCurrentUserProfile().subscribe({
      next: (response: ApiResponse) => {
        this.isLoadingUserData = false;
        if (response.success && response.user) {
          console.log('✅ User data loaded from API for editing:', response.user);
          this.user = {
            ...response.user,
            bio: (response.user as any).bio || '' 
          };
          
          this.originalPhoneNumber = response.user.phoneNumber || '';
          this.populateForm();
          this.loadProfilePicture();
          this.updateLocalUserData(response.user);
        } else {
          console.warn('⚠️ API response unsuccessful, loading from local storage');
          this.snackBar.open('Failed to load profile data from server', 'Close', { duration: 3000 });
          this.loadUserDataFromLocalStorage();
        }
      },
      error: (error: any) => {
        this.isLoadingUserData = false;
        console.error('❌ Error loading user data from API:', error);
        
        if (error.status === 401 || error.status === 403) {
          console.error('🔐 Authentication error, redirecting to login');
          this.snackBar.open('Authentication failed. Please log in again.', 'Login', { 
            duration: 5000 
          }).onAction().subscribe(() => {
            this.authService.logout();
          });
          this.router.navigate(['/auth/login']);
        } else {
          console.warn('⚠️ Network or server error, loading from local storage');
          this.snackBar.open('Error loading profile data from server', 'Close', { duration: 3000 });
          this.loadUserDataFromLocalStorage();
        }
      }
    });
  }

  private loadUserDataFromLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.user = {
        ...currentUser,
        bio: (currentUser as any).bio || '' 
      };
      
      this.originalPhoneNumber = currentUser.phoneNumber || '';
      this.populateForm();
      this.loadProfilePicture();
      
      console.log('⚠️ Loaded user from local storage for editing:', this.user);
    } else {
      console.warn('No user data available');
      this.router.navigate(['/auth/login']);
    }
  }

  private loadProfilePicture(): void {
    this.propertyService.getProfilePicture().subscribe({
      next: (response) => {
        if (response.success && response.pictureUrl) {
          this.profileImage = response.pictureUrl;
          localStorage.setItem('profileImage', response.pictureUrl);
          console.log('✅ Profile picture loaded from API');
        } else {
          this.profileImage = this.generateInitialAvatar(this.user?.fullName || 'User');
          console.log('Using generated avatar');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading profile picture:', error);
        const cachedImage = localStorage.getItem('profileImage');
        if (cachedImage) {
          this.profileImage = cachedImage;
          console.log('Using cached profile picture');
        } else {
          this.profileImage = this.generateInitialAvatar(this.user?.fullName || 'User');
          console.log('Using generated avatar (fallback)');
        }
      }
    });
  }

  private generateInitialAvatar(name: string): string {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}" rx="100"/>
        <text x="100" y="125" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/),
        Validators.minLength(10)
      ]],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName || '',
        email: this.user.email || '',
        phoneNumber: this.user.phoneNumber || '',
        bio: this.user.bio || ''
      });
    }
  }

  changePhoto(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    fileInput.onchange = (event: any) => this.handleImageUpload(event);
    fileInput.click();
  }

  private handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('Image size must be less than 10MB', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isUploadingPhoto = true;

    this.compressImage(file, 800, 0.8).then(compressedFile => {
      this.propertyService.uploadProfilePicture(compressedFile).subscribe({
        next: (response: ApiResponse) => {
          this.isUploadingPhoto = false;
          if (response.success) {
            this.loadProfilePicture();
            this.snackBar.open('Profile photo updated successfully!', 'Close', { 
              duration: 2000,
              panelClass: ['success-snackbar']
            });
            this.triggerProfileUpdate();
          } else {
            this.snackBar.open(response.message || 'Failed to upload photo', 'Close', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error: any) => {
          this.isUploadingPhoto = false;
          console.error('❌ Upload error:', error);
          this.snackBar.open('Failed to upload profile photo', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }).catch(error => {
      this.isUploadingPhoto = false;
      console.error('Image compression error:', error);
      this.snackBar.open('Error processing image', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    });
  }

  private compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > width && height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log(`✅ Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async startCamera(): Promise<void> {
    try {
      this.isCameraActive = true;
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      setTimeout(() => {
        this.videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
        this.canvasElement = document.getElementById('cameraCanvas') as HTMLCanvasElement;
        
        if (this.videoElement && this.stream) {
          this.videoElement.srcObject = this.stream;
          console.log('✅ Camera started successfully');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      this.snackBar.open('Unable to access camera. Please check permissions.', 'Close', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.stopCamera();
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('📷 Camera stopped');
    }
    this.isCameraActive = false;
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  capturePhoto(): void {
    if (!this.videoElement || !this.canvasElement) {
      console.error('❌ Video or canvas element not found');
      return;
    }

    const context = this.canvasElement.getContext('2d');
    if (!context) {
      console.error('❌ Could not get canvas context');
      return;
    }

    const maxDimension = 800;
    let width = this.videoElement.videoWidth;
    let height = this.videoElement.videoHeight;

    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else if (height > width && height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }

    this.canvasElement.width = width;
    this.canvasElement.height = height;
    
    context.drawImage(this.videoElement, 0, 0, width, height);
    
    this.canvasElement.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `profile-capture-${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        console.log('✅ Photo captured:', (blob.size / 1024).toFixed(2), 'KB');
        this.uploadCapturedPhoto(file);
      }
    }, 'image/jpeg', 0.85);
  }

  private uploadCapturedPhoto(file: File): void {
    this.isUploadingPhoto = true;

    this.propertyService.updateProfilePicture(file).subscribe({
      next: (response: ApiResponse) => {
        this.isUploadingPhoto = false;
        if (response.success) {
          this.loadProfilePicture();
          this.snackBar.open('Photo captured successfully! 📸', 'Close', { 
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.triggerProfileUpdate();
          this.stopCamera();
        } else {
          this.snackBar.open(response.message || 'Failed to update photo', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error: any) => {
        this.isUploadingPhoto = false;
        console.error('❌ Upload error:', error);
        this.snackBar.open('Failed to upload captured photo', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.stopCamera();
      }
    });
  }

  deletePhoto(): void {
    if (this.isDeletingPhoto) return;

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    this.isDeletingPhoto = true;

    this.propertyService.deleteProfilePicture().subscribe({
      next: (response: ApiResponse) => {
        this.isDeletingPhoto = false;
        if (response.success) {
          this.profileImage = this.generateInitialAvatar(this.user?.fullName || 'User');
          localStorage.removeItem('profileImage');
          this.snackBar.open('Profile photo removed successfully', 'Close', { 
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.triggerProfileUpdate();
        } else {
          this.snackBar.open(response.message || 'Failed to remove photo', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error: any) => {
        this.isDeletingPhoto = false;
        console.error('❌ Delete error:', error);
        this.snackBar.open('Failed to remove profile photo', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private triggerProfileUpdate(): void {
    window.dispatchEvent(new CustomEvent('profileImageUpdated'));
    localStorage.setItem('profileUpdated', Date.now().toString());
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;
    
    const newPhoneNumber = this.profileForm.value.phoneNumber?.trim();
    const phoneChanged = newPhoneNumber !== this.originalPhoneNumber;

    if (phoneChanged && newPhoneNumber) {
      this.updatePhoneNumber(newPhoneNumber);
    } else {
      this.updateUserProfile();
    }
  }

  private updatePhoneNumber(newPhoneNumber: string): void {
    const updatePhoneRequest: UpdatePhoneRequest = { newPhoneNumber };

    this.authService.updatePhoneNumber(updatePhoneRequest).subscribe({
      next: (response: ApiResponse) => {
        if (response.success) {
          console.log('✅ Phone number updated');
          this.updateUserProfile();
        } else {
          this.isSubmitting = false;
          this.snackBar.open(
            response.message || 'Failed to update phone number',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      },
      error: (error: any) => {
        console.error('❌ Update phone error:', error);
        this.isSubmitting = false;
        this.snackBar.open(
          error.message || 'Failed to update phone number',
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private updateUserProfile(): void {
    if (!this.user) return;

    const updatedUserData = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email,
      bio: this.profileForm.value.bio
    };

    this.propertyService.updateUserProfile(updatedUserData).subscribe({
      next: (response: ApiResponse) => {
        if (response.success && response.user) {
          this.handleSuccess(response.user);
        } else {
          this.isSubmitting = false;
          this.snackBar.open(
            response.message || 'Failed to update profile',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      },
      error: (error: any) => {
        console.error('❌ Update profile error:', error);
        this.isSubmitting = false;
        this.snackBar.open(
          'Failed to update profile. Please try again.',
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private handleSuccess(updatedUser: User): void {
    this.updateLocalUserData(updatedUser);
    
    this.snackBar.open('Profile updated successfully!', 'Close', { 
      duration: 2000,
      panelClass: ['success-snackbar']
    });
    
    setTimeout(() => {
      this.router.navigate(['/landlord-dashboard/profile/view'], {
        state: { refreshProfile: true }
      });
      this.isSubmitting = false;
    }, 500);
  }

  private updateLocalUserData(user: User): void {
    const isPermanent = !!localStorage.getItem('userData');
    const storage = isPermanent ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(user));
    console.log('✅ User data updated in local storage:', user);
    
    if ((this.authService as any).currentUserSubject) {
      (this.authService as any).currentUserSubject.next(user);
    }
  }

  goBack(): void {
    this.router.navigate(['/landlord-dashboard/profile/view']);
  }

  cancel(): void {
    if (this.profileForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/landlord-dashboard/home']);
      }
    } else {
      this.router.navigate(['/landlord-dashboard/home']);
    }
  }

  isDefaultAvatar(): boolean {
    return this.profileImage?.includes('data:image/svg+xml') || false;
  }

  get fullName() { return this.profileForm.get('fullName'); }
  get email() { return this.profileForm.get('email'); }
  get phoneNumber() { return this.profileForm.get('phoneNumber'); }
  get bio() { return this.profileForm.get('bio'); }
}