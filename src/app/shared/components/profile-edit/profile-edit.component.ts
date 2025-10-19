import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
import { AuthService } from '../../../services/auth.service';
import { PropertyService } from '../../../services/property.service';
import { ProfilePictureService } from '../../../services/profile-picture.service';

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
    MatTooltipModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  @Output() goBackEvent = new EventEmitter<void>(); 
  
  profileForm: FormGroup;
  user: any = null;
  isSubmitting = false;
  isLoadingUserData = false;
  
  imageUrl: string | null = null;
  uploading: boolean = false;
  loading: boolean = true;
  showImageOptions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propertyService: PropertyService,
    private profilePictureService: ProfilePictureService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {}

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.populateForm();
  }

  private loadProfilePicture(): void {
    this.profilePictureService.getProfilePicture().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.pictureUrl) {
          const timestamp = new Date().getTime();
          const cacheBustedUrl = response.pictureUrl.includes('?') 
            ? `${response.pictureUrl}&t=${timestamp}`
            : `${response.pictureUrl}?t=${timestamp}`;
          
          this.imageUrl = cacheBustedUrl;
        } else {
          this.imageUrl = this.profilePictureService.getDefaultAvatar(this.user?.fullName);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load profile picture:', error);
        this.imageUrl = this.profilePictureService.getDefaultAvatar(this.user?.fullName);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [
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

  toggleImageOptions(): void {
    this.showImageOptions = !this.showImageOptions;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.isValidFileType(file)) {
        this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, WEBP)', 'Close', { duration: 3000 });
        return;
      }
      
      if (!this.isValidFileSize(file)) {
        this.snackBar.open('File size should be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      this.uploadProfilePicture(file);
    }
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  isValidFileSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024;
    return file.size <= maxSize;
  }

  uploadProfilePicture(file: File): void {
    this.uploading = true;
    this.showImageOptions = false;

    this.profilePictureService.uploadProfilePicture(file).subscribe({
      next: (response) => {
        this.uploading = false;
        if (response.success && response.pictureUrl) {
          const timestamp = new Date().getTime();
          const cacheBustedUrl = response.pictureUrl.includes('?') 
            ? `${response.pictureUrl}&t=${timestamp}`
            : `${response.pictureUrl}?t=${timestamp}`;
          
          this.imageUrl = cacheBustedUrl;
          this.snackBar.open('Profile picture updated successfully!', 'Close', { duration: 3000 });
          
          localStorage.setItem('profileImage', cacheBustedUrl);
          window.dispatchEvent(new Event('profileImageUpdated'));
        } else {
          this.snackBar.open('Failed to upload profile picture', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.uploading = false;
        console.error('Upload failed:', error);
        this.snackBar.open('Failed to upload profile picture. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  deletePicture(): void {
    if (confirm('Are you sure you want to delete your profile picture?')) {
      this.profilePictureService.deleteProfilePicture().subscribe({
        next: (response) => {
          if (response.success) {
            this.imageUrl = this.profilePictureService.getDefaultAvatar(this.user?.fullName);
            this.showImageOptions = false;
            this.snackBar.open('Profile picture removed successfully!', 'Close', { duration: 3000 });
            
            localStorage.removeItem('profileImage');
            window.dispatchEvent(new Event('profileImageUpdated'));
          } else {
            this.snackBar.open('Failed to delete profile picture', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Delete failed:', error);
          this.snackBar.open('Failed to delete profile picture. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onImageError(): void {
    this.imageUrl = this.profilePictureService.getDefaultAvatar(this.user?.fullName);
  }

  getInitials(): string {
    if (!this.user?.fullName) return '?';
    
    const names = this.user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  isDefaultAvatar(): boolean {
    return !this.imageUrl || this.imageUrl.includes('svg+xml');
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    const updatedData = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email,
      phoneNumber: this.profileForm.value.phoneNumber,
      bio: this.profileForm.value.bio
    };

    setTimeout(() => {
      this.isSubmitting = false;
      
      const updatedUser = {
        ...this.user,
        ...updatedData
      };
      
      const isPermanent = !!localStorage.getItem('userData');
      const storage = isPermanent ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(updatedUser));
      
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 2000 });
      
      setTimeout(() => {
        this.goBack(); 
      }, 500);
      
    }, 1500);
  }

  goBack(): void {
    this.goBackEvent.emit(); 
  }

  cancel(): void {
    if (this.profileForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.goBack(); 
      }
    } else {
      this.goBack(); 
    }
  }

  getRoleDisplay(role: string): string {
    const roleMap: { [key: string]: string } = {
      'landlord': 'Landlord',
      'tenant': 'Tenant',
      'caretaker': 'Caretaker',
      'admin': 'Administrator',
      'business': 'Business',
      'user': 'User'
    };
    return roleMap[role] || 'User';
  }

  get fullName() { return this.profileForm.get('fullName'); }
  get email() { return this.profileForm.get('email'); }
  get phoneNumber() { return this.profileForm.get('phoneNumber'); }
  get bio() { return this.profileForm.get('bio'); }
}