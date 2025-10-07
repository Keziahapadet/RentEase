import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { PropertyService } from '../../../../../../services/property.service';
import { User, UserRole, ApiResponse } from '../../../../../../services/auth-interfaces';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  user: User | null = null;
  profileImage: string | null = null;
  formattedRole: string = 'User';
  isLoadingProfilePicture = false;
  isLoadingUserData = false;
  private subscriptions = new Subscription();

  constructor() {
   
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['refreshProfile']) {
      this.loadUserDataFromApi();
    }
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToUpdates(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          console.log('User updated from service:', user);
          this.user = user;
          this.formattedRole = this.formatUserRole(user.role);
          this.loadProfilePictureFromApi();
        }
      })
    );


    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          console.log('Navigation detected, reloading user data');
          this.loadUserData();
        })
    );

    
    this.subscriptions.add(
      window.addEventListener('profileImageUpdated', () => {
        console.log('Profile image update event received');
        this.loadProfilePictureFromApi();
      })
    );
  }

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
    console.log('Loaded user data from local storage:', this.user);
    
    if (this.user) {
      this.formattedRole = this.formatUserRole(this.user.role);
      this.loadCachedProfileImage();
    }

   
    this.loadUserDataFromApi();
  }

  private loadUserDataFromApi(): void {
    this.isLoadingUserData = true;
    
   
    this.propertyService.getCurrentUserProfile().subscribe({
      next: (response: ApiResponse) => {
        this.isLoadingUserData = false;
        if (response.success && response.user) {
          console.log('User data loaded from API:', response.user);
          this.user = response.user;
          this.formattedRole = this.formatUserRole(response.user.role);
          
         
     this.propertyService.updateLocalUserData(response.user);
          
         
          this.loadProfilePictureFromApi();
        } else {
          console.warn('No user data received from API:', response.message);
          this.snackBar.open('Failed to load profile data', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        this.isLoadingUserData = false;
        console.error('Error loading user data from API:', error);
        this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
        
       
        if (!this.user) {
          this.user = this.authService.getCurrentUser();
          if (this.user) {
            this.formattedRole = this.formatUserRole(this.user.role);
          }
        }
      }
    });
  }

  private loadProfilePictureFromApi(): void {
    this.isLoadingProfilePicture = true;
    
   
    this.propertyService.getProfilePicture().subscribe({
      next: (response) => {
        this.isLoadingProfilePicture = false;
        if (response.success && response.pictureUrl) {
          this.profileImage = response.pictureUrl;
          localStorage.setItem('profileImage', response.pictureUrl);
          console.log('Profile picture loaded from API:', response.pictureUrl);
        } else {
          this.loadCachedProfileImage();
          console.log('No profile picture from API, using fallback');
        }
      },
      error: (error: any) => {
        this.isLoadingProfilePicture = false;
        console.error('Error loading profile picture from API:', error);
        this.loadCachedProfileImage();
      }
    });
  }

  private loadCachedProfileImage(): void {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      this.profileImage = savedImage;
      console.log('Profile picture loaded from cache');
    } else if (this.user?.avatar) {
      this.profileImage = this.user.avatar;
      console.log('Profile picture loaded from user avatar');
    } else {
      this.profileImage = this.generateInitialAvatar(this.getUserFullName());
      console.log('Profile picture generated as initial avatar');
    }
  }

  private generateInitialAvatar(name: string): string {
    const names = name.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}" rx="50"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="40" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  private formatUserRole(role: string | UserRole): string {
    const roleMap: { [key: string]: string } = {
      'LANDLORD': 'Landlord',
      'TENANT': 'Tenant',
      'CARETAKER': 'Caretaker',
      'BUSINESS': 'Business Owner',
      'ADMIN': 'Administrator'
    };
    
    return roleMap[role.toString()] || role.toString();
  }

  getUserFullName(): string {
    return this.user?.fullName || 'User';
  }

  getUserEmail(): string {
    return this.user?.email || 'No email provided';
  }

  getUserPhone(): string {
    console.log('Getting phone number:', this.user?.phoneNumber);
    return this.user?.phoneNumber || 'Not provided';
  }

  getEmailVerificationStatus(): string {
    return this.user?.emailVerified ? 'Verified' : 'Not Verified';
  }

  getAccountStatus(): string {
    return this.user?.verified ? 'Active' : 'Inactive';
  }

  getMemberSince(): string {
    if (this.user?.createdAt) {
      return new Date(this.user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  }

  editProfile(): void {
    this.router.navigate(['/landlord-dashboard/profile/edit']);
  }

  goBack(): void {
    this.router.navigate(['/landlord-dashboard/home']);
  }

 
  refreshProfile(): void {
    console.log('Manually refreshing profile data');
    this.loadUserDataFromApi();
  }
}