import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TenantService } from '../../../../services/tenant.service';
import { ProfilePictureService, UserProfile } from '../../../../services/profile-picture.service';
import { ProfilePictureComponent } from '../../../../shared/components/profile-picture/profile-picture.component';
import { ProfileViewComponent } from '../../../../shared/components/profile-view/profile-view.component';
import { ProfileEditComponent } from '../../../../shared/components/profile-edit/profile-edit.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add this for ngModel and ngForm
    MatIconModule,
    ProfilePictureComponent,
    ProfileViewComponent,
    ProfileEditComponent
  ],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.scss']
})
export class TenantDashboardComponent implements OnInit, OnDestroy {
  private tenantService = inject(TenantService);
  private profilePictureService = inject(ProfilePictureService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Dashboard state
  activeSection: string = 'dashboard';
  isMobileMenuOpen: boolean = false;
  
  // User data
  userProfile: UserProfile | null = null;
  profileImage: string | null = null;
  userName: string = 'Tenant';
  userInitials: string = 'T';
  propertyAddress: string = 'Loading...';
  landlordName: string = 'Loading...';
  
  // Dashboard data
  depositAmount: number = 0;
  rentAmount: number = 0;
  nextRentDueDate: string = '';
  unreadNotifications: number = 0;
  
  // Collapsible sections
  collapsedSections: Set<string> = new Set();
  animatingSections: Set<string> = new Set();
  
  // Payment status
  paymentStatus = {
    status: 'Pending',
    className: 'status-pending',
    daysLeft: 5
  };
  
  // Navigation
  navigationItems = [
    { id: 'deposit', text: 'Deposit', icon: 'account_balance_wallet' },
    { id: 'payments', text: 'Payments', icon: 'payments' },
    { id: 'maintenance', text: 'Maintenance', icon: 'build' },
    { id: 'documents', text: 'Documents', icon: 'description' },
    { id: 'messages', text: 'Messages', icon: 'chat' },
    { id: 'marketplace', text: 'Marketplace', icon: 'store' },
    { id: 'reviews', text: 'Reviews', icon: 'star' },
    { id: 'settings', text: 'Settings', icon: 'settings' }
  ];
  
  // Quick actions
  quickActions = [
    { id: 'payRent', title: 'Pay Rent', description: 'Make rent payment', icon: 'payments', color: '#4CAF50' },
    { id: 'maintenance', title: 'Maintenance', description: 'Submit request', icon: 'build', color: '#FF9800' },
    { id: 'message', title: 'Message', description: 'Contact landlord', icon: 'chat', color: '#2196F3' },
    { id: 'documents', title: 'Documents', description: 'View lease', icon: 'description', color: '#9C27B0' }
  ];
  
  // Deposit timeline
  depositTimeline = [
    { title: 'Deposit Paid', date: '2024-01-15', completed: true, description: 'Initial security deposit payment' },
    { title: 'Lease Signed', date: '2024-01-20', completed: true, description: 'Rental agreement executed' },
    { title: 'Property Inspection', date: '2024-01-25', completed: true, description: 'Move-in inspection completed' },
    { title: 'Deposit Protection', date: 'Pending', completed: false, description: 'Government protection registration' },
    { title: 'Deposit Certificate', date: 'Pending', completed: false, description: 'Receive protection certificate' }
  ];
  
  // Recent activities
  recentActivities = [
    { id: 1, type: 'payment', title: 'Rent Payment', description: 'January rent payment completed', time: '2 days ago', icon: 'payments' },
    { id: 2, type: 'maintenance', title: 'Maintenance Request', description: 'Kitchen sink repair requested', time: '1 week ago', icon: 'build' },
    { id: 3, type: 'message', title: 'New Message', description: 'Message from landlord', time: '1 week ago', icon: 'chat' }
  ];
  
  // Maintenance request
  newMaintenanceRequest = {
    title: '',
    description: '',
    priority: 'medium'
  };

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {}

  private loadUserData(): void {
    this.profilePictureService.getCurrentUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
        this.userName = profile.fullName || 'Tenant';
        this.userInitials = this.getInitials(this.userName);
        this.loadProfilePicture();
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.loadUserDataFromLocalStorage();
      }
    });
  }

  private loadUserDataFromLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.fullName || 'Tenant';
      this.userInitials = this.getInitials(this.userName);
    }
  }

  private loadProfilePicture(): void {
    this.profilePictureService.getProfilePicture().subscribe({
      next: (response: any) => {
        const imageUrl = response.data || response.pictureUrl;
        
        if (response.success && imageUrl) {
          this.profileImage = imageUrl;
          localStorage.setItem('profileImage', imageUrl);
        } else {
          this.profileImage = this.profilePictureService.getDefaultAvatar(this.userName);
        }
      },
      error: (error: any) => {
        const cachedImage = localStorage.getItem('profileImage');
        if (cachedImage) {
          this.profileImage = cachedImage;
        } else {
          this.profileImage = this.profilePictureService.getDefaultAvatar(this.userName);
        }
      }
    });
  }

  private loadDashboardData(): void {
    // Load tenant-specific data
    this.tenantService.getTenantDashboardData().subscribe({
      next: (data: any) => {
        this.propertyAddress = data.propertyAddress || '123 Main Street, Nairobi';
        this.landlordName = data.landlordName || 'John Doe';
        this.depositAmount = data.depositAmount || 50000;
        this.rentAmount = data.rentAmount || 25000;
        this.nextRentDueDate = data.nextRentDueDate || '2024-02-01';
        this.unreadNotifications = data.unreadNotifications || 3;
        
        // Update payment status
        this.updatePaymentStatus();
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        // Set default values
        this.propertyAddress = '123 Main Street, Nairobi';
        this.landlordName = 'John Doe';
        this.depositAmount = 50000;
        this.rentAmount = 25000;
        this.nextRentDueDate = '2024-02-01';
        this.unreadNotifications = 3;
        this.updatePaymentStatus();
      }
    });
  }

  private updatePaymentStatus(): void {
    const today = new Date();
    const dueDate = new Date(this.nextRentDueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) {
      this.paymentStatus = { status: 'Overdue', className: 'status-overdue', daysLeft: 0 };
    } else if (daysUntilDue <= 7) {
      this.paymentStatus = { status: 'Due Soon', className: 'status-warning', daysLeft: daysUntilDue };
    } else {
      this.paymentStatus = { status: 'Paid', className: 'status-success', daysLeft: daysUntilDue };
    }
  }

  // Navigation methods
  setActiveSection(section: string): void {
    this.activeSection = section;
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Collapsible sections
  toggleSection(section: string): void {
    if (this.collapsedSections.has(section)) {
      this.collapsedSections.delete(section);
    } else {
      this.collapsedSections.add(section);
    }
    
    this.animatingSections.add(section);
    setTimeout(() => {
      this.animatingSections.delete(section);
    }, 300);
  }

  isSectionCollapsed(section: string): boolean {
    return this.collapsedSections.has(section);
  }

  isAnimating(section: string): boolean {
    return this.animatingSections.has(section);
  }

  expandAllSections(): void {
    this.collapsedSections.clear();
  }

  collapseAllSections(): void {
    this.navigationItems.forEach(item => {
      this.collapsedSections.add(item.id);
    });
    this.collapsedSections.add('deposit');
    this.collapsedSections.add('rental');
    this.collapsedSections.add('quickActions');
    this.collapsedSections.add('activity');
  }

  getCollapsedCount(): number {
    return this.collapsedSections.size;
  }

  getAriaLabel(section: string): string {
    return this.isSectionCollapsed(section) ? `Expand ${section} section` : `Collapse ${section} section`;
  }

  // Quick actions
  executeQuickAction(actionId: string): void {
    switch (actionId) {
      case 'payRent':
        this.setActiveSection('payments');
        break;
      case 'maintenance':
        this.setActiveSection('maintenance');
        break;
      case 'message':
        this.setActiveSection('messages');
        break;
      case 'documents':
        this.setActiveSection('documents');
        break;
    }
  }

  // Deposit methods
  getDepositStatusText(): string {
    return 'Protected';
  }

  getCompletedTimelineCount(): number {
    return this.depositTimeline.filter(event => event.completed).length;
  }

  getTotalTimelineCount(): number {
    return this.depositTimeline.length;
  }

  getTimelineCompletionPercentage(): number {
    return (this.getCompletedTimelineCount() / this.getTotalTimelineCount()) * 100;
  }

  viewDepositDetails(): void {
    this.setActiveSection('deposit');
  }

  viewPaymentHistory(): void {
    this.setActiveSection('payments');
  }

  // Activity methods
  hasRecentActivities(): boolean {
    return this.recentActivities && this.recentActivities.length > 0;
  }

  getRecentActivitiesCount(): number {
    return this.recentActivities ? this.recentActivities.length : 0;
  }

  getActivityIconClass(type: string): string {
    return `activity-${type}`;
  }

  trackByActivityId(index: number, activity: any): number {
    return activity.id;
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Maintenance methods
  submitMaintenanceRequest(): void {
    if (this.newMaintenanceRequest.title && this.newMaintenanceRequest.description) {
      this.tenantService.submitMaintenanceRequest(this.newMaintenanceRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Reset form
            this.newMaintenanceRequest = { title: '', description: '', priority: 'medium' };
            // Show success message
            alert('Maintenance request submitted successfully!');
          } else {
            alert('Failed to submit maintenance request: ' + response.message);
          }
        },
        error: (error) => {
          alert('Error submitting maintenance request: ' + error.message);
        }
      });
    }
  }

  // Utility methods
  getInitials(name: string): string {
    if (!name) return 'T';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-KE');
  }

  formatCurrency(amount: number): string {
    return `KSH ${this.formatNumber(amount)}`;
  }

  toggleNotifications(): void {
    // Implement notification toggle logic
    console.log('Toggle notifications');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  onPictureUpdated(imageUrl: string): void {
    this.profileImage = imageUrl;
  }

  onPictureDeleted(): void {
    this.profileImage = this.profilePictureService.getDefaultAvatar(this.userName);
  }
}