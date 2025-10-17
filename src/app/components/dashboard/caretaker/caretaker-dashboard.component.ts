import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ProfilePictureComponent } from '../../../shared/components/profile-picture/profile-picture.component';
import { CaretakerService, Property, Unit, MaintenanceRequest, Inspection, DepositCase } from '../../../services/caretaker.service';
import { ProfilePictureService, UserProfile } from '../../../services/profile-picture.service';

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
    ProfilePictureComponent
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
    { id: 'reports', label: 'Reports', icon: 'assessment' }
  ];

  // Data for overview section
  stats: Stats = {
    pendingMaintenance: 5,
    scheduledInspections: 3,
    activeDepositCases: 2,
    completedJobs: 12,
    responseRate: 92,
    tenantSatisfaction: 4.5
  };

  maintenanceRequests: MaintenanceRequest[] = [
    { 
      id: '1', 
      title: 'Kitchen faucet leaking', 
      category: 'Plumbing', 
      priority: 'medium', 
      description: 'Kitchen sink faucet has constant drip', 
      status: 'submitted', 
      dateSubmitted: '2024-03-01', 
      tenantName: 'John Doe', 
      property: 'Apartment 4B' 
    },
    { 
      id: '2', 
      title: 'Broken window lock', 
      category: 'General Repairs', 
      priority: 'low', 
      description: 'Bedroom window lock not closing properly', 
      status: 'in-progress', 
      dateSubmitted: '2024-02-28', 
      tenantName: 'Sarah Smith', 
      property: 'House 12' 
    },
    { 
      id: '3', 
      title: 'AC not cooling', 
      category: 'HVAC', 
      priority: 'high', 
      description: 'Air conditioning not cooling living room', 
      status: 'submitted', 
      dateSubmitted: '2024-03-02', 
      tenantName: 'Mike Johnson', 
      property: 'Apartment 7C' 
    }
  ];

  inspections: Inspection[] = [
    { 
      id: '1', 
      type: 'move-out', 
      property: 'Apartment 3A', 
      tenantName: 'David Wilson', 
      date: '2024-03-05', 
      status: 'scheduled', 
      depositAmount: 50000 
    },
    { 
      id: '2', 
      type: 'move-in', 
      property: 'House 15', 
      tenantName: 'Emma Davis', 
      date: '2024-03-06', 
      status: 'scheduled', 
      depositAmount: 75000 
    },
    { 
      id: '3', 
      type: 'routine', 
      property: 'Apartment 2B', 
      tenantName: 'James Miller', 
      date: '2024-03-10', 
      status: 'scheduled', 
      depositAmount: 0 
    }
  ];

  depositCases: DepositCase[] = [
    {
      id: '1',
      tenantName: 'John Smith',
      property: 'Apartment 4B',
      depositAmount: 50000,
      status: 'pending',
      damageAmount: 0
    },
    {
      id: '2',
      tenantName: 'Maria Garcia',
      property: 'Unit 2A',
      depositAmount: 75000,
      status: 'pending',
      damageAmount: 15000
    },
    {
      id: '3',
      tenantName: 'Robert Johnson',
      property: 'Suite 5C',
      depositAmount: 60000,
      status: 'approved',
      damageAmount: 5000
    }
  ];

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

  // Table columns
  displayedMaintenanceColumns: string[] = ['title', 'category', 'priority', 'status', 'tenantName', 'property', 'actions'];
  displayedInspectionColumns: string[] = ['type', 'property', 'tenantName', 'date', 'status', 'depositAmount', 'actions'];
  displayedDepositColumns: string[] = ['tenantName', 'property', 'depositAmount', 'status', 'damageAmount', 'actions'];

  constructor(
    private caretakerService: CaretakerService,
    private profilePictureService: ProfilePictureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadData();
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
        // Set fallback profile
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

  loadData(): void {
    // Load your existing dashboard data
    this.caretakerService.getMaintenanceRequests().subscribe(requests => {
      this.maintenanceRequests = requests;
      this.updateStats();
    });

    this.caretakerService.getInspections().subscribe(inspections => {
      this.inspections = inspections;
      this.updateStats();
    });

    this.caretakerService.getDepositCases().subscribe(deposits => {
      this.depositCases = deposits;
      this.updateStats();
    });
  }

  // Handle profile picture updates
  onPictureUpdated(imageUrl: string): void {
    console.log('Profile picture updated:', imageUrl);
    if (this.userProfile) {
      this.userProfile.profilePicture = imageUrl;
    }
    // Show success message
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
    // Implement your notification logic here (toast, snackbar, etc.)
    alert(message); // Temporary - replace with proper notification
  }

  setView(view: string): void {
    this.currentView = view;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  refreshData(): void {
    this.loadUserProfile();
    this.loadData();
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

  // Quick Actions
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

  // Maintenance methods
  updateMaintenanceStatus(request: MaintenanceRequest, status: string): void {
    request.status = status as any;
    this.updateStats();
  }

  // Inspection methods
  completeInspection(inspection: Inspection): void {
    inspection.status = 'completed';
  }

  // Deposit methods
  approveDeposit(deposit: DepositCase): void {
    deposit.status = 'approved';
  }

  rejectDeposit(deposit: DepositCase): void {
    deposit.status = 'rejected';
  }

  getPendingDepositCount(): number {
    return this.depositCases.filter(d => d.status === 'pending').length;
  }

  getScheduledInspectionsCount(): number {
    return this.inspections.filter(inspection => inspection.status === 'scheduled').length;
  }

  // Utility methods
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

  updateStats(): void {
    this.stats.pendingMaintenance = this.maintenanceRequests.filter(r => 
      r.status === 'submitted' || r.status === 'in-progress'
    ).length;
    this.stats.completedJobs = this.maintenanceRequests.filter(r => r.status === 'completed').length;
    this.stats.scheduledInspections = this.inspections.filter(i => i.status === 'scheduled').length;
    this.stats.activeDepositCases = this.depositCases.filter(d => d.status === 'pending').length;
  }
}