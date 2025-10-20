import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../services/auth.service';
import { ProfilePictureService } from '../../../services/profile-picture.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  @Output() editProfileEvent = new EventEmitter<void>(); 
  @Output() goBackEvent = new EventEmitter<void>(); 
  
  user: any = null;
  userRole: 'caretaker' | 'tenant' | 'landlord' | 'admin' | 'business' | 'user' = 'user';
  imageUrl: string | null = null;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private profilePictureService: ProfilePictureService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadProfilePicture();
  }

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
    
    console.log('🔍 PROFILE VIEW - Raw user data:', this.user);
    
    if (!this.user) {
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    // Determine the actual user role
    this.determineActualUserRole();
    
    console.log('🔍 PROFILE VIEW - Final determined role:', this.userRole);
  }

  private determineActualUserRole(): void {
    // Method 1: Check if role exists in stored user data
    if (this.user?.role && this.user.role !== 'user') {
      // Type assertion for the role
      const role = this.user.role as 'caretaker' | 'tenant' | 'landlord' | 'admin' | 'business' | 'user';
      if (['caretaker', 'tenant', 'landlord', 'admin', 'business', 'user'].includes(role)) {
        this.userRole = role;
        console.log('✅ PROFILE VIEW - Role from user data:', this.userRole);
        return;
      }
    }

    // Method 2: Use AuthService role checking methods to determine actual role
    if (this.authService.isTenant()) {
      this.userRole = 'tenant';
      console.log('✅ PROFILE VIEW - User is a Tenant (from token)');
    } else if (this.authService.isCaretaker()) {
      this.userRole = 'caretaker';
      console.log('✅ PROFILE VIEW - User is a Caretaker (from token)');
    } else if (this.authService.isLandlord()) {
      this.userRole = 'landlord';
      console.log('✅ PROFILE VIEW - User is a Landlord (from token)');
    } else if (this.authService.isBusiness()) {
      this.userRole = 'business';
      console.log('✅ PROFILE VIEW - User is a Business (from token)');
    } else if (this.authService.isAdmin()) {
      this.userRole = 'admin';
      console.log('✅ PROFILE VIEW - User is an Admin (from token)');
    } else {
      this.userRole = 'user';
      console.log('⚠️ PROFILE VIEW - Default role: user');
    }

    // Update the user object with the correct role for display
    if (this.user) {
      this.user.role = this.userRole;
    }
  }

  private loadProfilePicture(): void {
    this.profilePictureService.getProfilePicture().subscribe({
      next: (response) => {
        this.loading = false;
        const pictureUrl = response.data || response.pictureUrl;
        
        if (response.success && pictureUrl) {
          const timestamp = new Date().getTime();
          const cacheBustedUrl = pictureUrl.includes('?') 
            ? `${pictureUrl}&t=${timestamp}`
            : `${pictureUrl}?t=${timestamp}`;
          
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

  editProfile(): void {
    this.editProfileEvent.emit(); 
  }

  goBack(): void {
    this.goBackEvent.emit(); 
  }

  getFormattedPhone(phone: string): string {
    if (!phone) return 'Not provided';
    return phone;
  }

  getFormattedBio(bio: string): string {
    if (!bio) return 'No bio provided yet. Tell us about yourself!';
    return bio;
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRoleDisplay(): string {
    const roleMap: { [key: string]: string } = {
      'landlord': 'Landlord',
      'tenant': 'Tenant',
      'caretaker': 'Caretaker',
      'admin': 'Administrator',
      'business': 'Business',
      'user': 'User'
    };
    return roleMap[this.userRole] || 'User';
  }

  getRoleColor(): string {
    const colorMap: { [key: string]: string } = {
      'landlord': '#ff6b35',
      'tenant': '#4CAF50',
      'caretaker': '#2196F3',
      'admin': '#9C27B0',
      'business': '#FF9800',
      'user': '#666'
    };
    return colorMap[this.userRole] || '#666';
  }
}