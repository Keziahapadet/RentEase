import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { CaretakerService, Property, Unit } from '../../../services/caretaker.service';
import { ProfilePictureService, UserProfile } from '../../../services/profile-picture.service';
import { ProfilePictureComponent } from '../../../shared/components/profile-picture/profile-picture.component';
import { ProfileViewComponent } from '../landlord/landlord-dashboard/profile/profile-view/profile-view.component';
import { ProfileEditComponent } from '../landlord/landlord-dashboard/profile/profile-edit/profile-edit.component';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface Stats {
  pendingMaintenance: number;
  scheduledInspections: number;
  activeDepositCases: number;
  completedJobs: number;
  responseRate: number;
  tenantSatisfaction: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-caretaker-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    ProfilePictureComponent,
    ProfileViewComponent,
    ProfileEditComponent
  ],
  templateUrl: './caretaker-dashboard.component.html',
  styleUrls: ['./caretaker-dashboard.component.scss']
})
export class CaretakerDashboardComponent implements OnInit {
  currentView: string = 'overview';
  isSidebarOpen = true;
  userProfile: UserProfile | null = null;
  loading: boolean = true;
  
  navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'maintenance', label: 'Maintenance', icon: 'build' },
    { id: 'inspections', label: 'Inspections', icon: 'home' },
    { id: 'deposits', label: 'Deposits', icon: 'account_balance' },
    { id: 'properties', label: 'Properties', icon: 'apartment' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'profile', label: 'Profile', icon: 'person' }
  ];

  stats: Stats = {
    pendingMaintenance: 5,
    scheduledInspections: 3,
    activeDepositCases: 2,
    completedJobs: 12,
    responseRate: 92,
    tenantSatisfaction: 4.5
  };

  quickActions: QuickAction[] = [
    { 
      id: 'newMaintenance', 
      title: 'New Maintenance', 
      description: 'Create maintenance request', 
      icon: 'build', 
      color: '#007bff', 
      action: () => this.createMaintenance() 
    },
    { 
      id: 'scheduleInspection', 
      title: 'Schedule Inspection', 
      description: 'Schedule property inspection', 
      icon: 'calendar_today', 
      color: '#28a745', 
      action: () => this.scheduleInspection() 
    },
    { 
      id: 'processDeposit', 
      title: 'Process Deposit', 
      description: 'Handle deposit release', 
      icon: 'account_balance', 
      color: '#ffc107', 
      action: () => this.processDeposit() 
    },
    { 
      id: 'contactTenant', 
      title: 'Contact Tenant', 
      description: 'Message tenant', 
      icon: 'message', 
      color: '#17a2b8', 
      action: () => this.contactTenant() 
    }
  ];

  constructor(
    private caretakerService: CaretakerService,
    private profilePictureService: ProfilePictureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.profilePictureService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.loading = false;
        this.userProfile = {
          id: 'unknown',
          fullName: 'Caretaker',
          email: '',
          role: 'caretaker',
          verified: false,
          emailVerified: false
        };
      }
    });
  }

  onPictureUpdated(imageUrl: string): void {
    console.log('Profile picture updated:', imageUrl);
    if (this.userProfile) {
      this.userProfile.profilePicture = imageUrl;
    }
    this.showNotification('Profile picture updated successfully!', 'success');
  }

  onPictureDeleted(): void {
    console.log('Profile picture deleted');
    if (this.userProfile) {
      this.userProfile.profilePicture = undefined;
    }
    this.showNotification('Profile picture deleted successfully!', 'success');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    alert(message);
  }

  setView(view: string): void {
    this.currentView = view;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  refreshData(): void {
    this.loadUserProfile();
  }

  logout(): void {
    this.caretakerService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  createMaintenance(): void {
    console.log('Creating new maintenance request...');
  }

  scheduleInspection(): void {
    console.log('Scheduling inspection...');
  }

  processDeposit(): void {
    console.log('Processing deposit...');
  }

  contactTenant(): void {
    console.log('Contacting tenant...');
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-KE');
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPriorityClass(priority: string): string {
    const priorityMap: any = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-medium';
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'submitted': 'status-pending',
      'in-progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'scheduled': 'status-scheduled',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  }

  getInspectionTypeClass(type: string): string {
    const typeMap: any = {
      'move-in': 'type-move-in',
      'move-out': 'type-move-out',
      'routine': 'type-routine'
    };
    return typeMap[type] || 'type-routine';
  }
}