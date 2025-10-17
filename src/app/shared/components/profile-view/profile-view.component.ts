import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfilePictureComponent } from '../../../shared/components/profile-picture/profile-picture.component';
import { AuthService } from '../../../services/auth.service';

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
    ProfilePictureComponent
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  user: any = null;
  profileStats = {
    properties: 0,
    tenants: 0,
    maintenance: 0,
    revenue: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    
    // Load demo stats (replace with actual API calls)
    this.loadProfileStats();
  }

  private loadProfileStats(): void {
    // Demo data - replace with actual API calls
    const role = this.user?.role || 'user';
    
    // Different stats based on user role
    if (role === 'landlord') {
      this.profileStats = {
        properties: 5,
        tenants: 12,
        maintenance: 3,
        revenue: 125000
      };
    } else if (role === 'caretaker') {
      this.profileStats = {
        properties: 3,
        tenants: 8,
        maintenance: 5,
        revenue: 0
      };
    } else if (role === 'tenant') {
      this.profileStats = {
        properties: 1,
        tenants: 0,
        maintenance: 2,
        revenue: 0
      };
    } else {
      this.profileStats = {
        properties: 0,
        tenants: 0,
        maintenance: 0,
        revenue: 0
      };
    }
  }

  editProfile(): void {
    // Navigate based on user role
    const role = this.user?.role || 'user';
    if (role === 'landlord') {
      this.router.navigate(['/landlord-dashboard/profile/edit']);
    } else if (role === 'caretaker') {
      this.router.navigate(['/caretaker-dashboard/profile/edit']);
    } else if (role === 'tenant') {
      this.router.navigate(['/tenant-dashboard/profile/edit']);
    } else {
      this.router.navigate(['/profile/edit']);
    }
  }

  goBack(): void {
    // Navigate back based on user role
    const role = this.user?.role || 'user';
    if (role === 'landlord') {
      this.router.navigate(['/landlord-dashboard/home']);
    } else if (role === 'caretaker') {
      this.router.navigate(['/caretaker-dashboard/home']);
    } else if (role === 'tenant') {
      this.router.navigate(['/tenant-dashboard/home']);
    } else {
      this.router.navigate(['/home']);
    }
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

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
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

  getStatLabel(stat: string): string {
    const role = this.user?.role || 'user';
    
    if (role === 'tenant') {
      const tenantLabels: { [key: string]: string } = {
        'properties': 'Current Property',
        'tenants': 'Housemates',
        'maintenance': 'My Requests',
        'revenue': 'Monthly Rent'
      };
      return tenantLabels[stat] || stat;
    }
    
    const defaultLabels: { [key: string]: string } = {
      'properties': 'Properties',
      'tenants': 'Tenants',
      'maintenance': 'Maintenance',
      'revenue': 'Revenue'
    };
    return defaultLabels[stat] || stat;
  }
}