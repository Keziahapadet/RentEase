import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  @Output() editProfileEvent = new EventEmitter<void>(); 
  @Output() goBackEvent = new EventEmitter<void>(); 
  
  user: any = null;
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
    if (!this.user) {
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
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
}