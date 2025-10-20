import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { CaretakerService, Property, Unit } from '../../../services/caretaker.service';
import { ProfilePictureService, UserProfile } from '../../../services/profile-picture.service';
import { AuthService } from '../../../services/auth.service';
import { ProfilePictureComponent } from '../../../shared/components/profile-picture/profile-picture.component';
import { ProfileViewComponent } from '../../../shared/components/profile-view/profile-view.component';
import { ProfileEditComponent } from '../../../shared/components/profile-edit/profile-edit.component';

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
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export interface Activity {
  id: string;
  type: 'maintenance' | 'inspection' | 'deposit' | 'message';
  title: string;
  details: string;
  time: string;
  propertyId?: number;
  unitId?: number;
}

@Component({
  selector: 'app-caretaker-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
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
  isMobile = false;
  isMobileMenuOpen = false;
  userProfile: UserProfile | null = null;
  userRole: 'caretaker' | 'tenant' | 'landlord' | 'admin' | 'business' | 'user' = 'caretaker';
  loading: boolean = true;
  
  properties: Property[] = [];
  units: Unit[] = [];
  recentActivities: Activity[] = [];

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
    pendingMaintenance: 0,
    scheduledInspections: 0,
    activeDepositCases: 0,
    completedJobs: 0,
    responseRate: 0,
    tenantSatisfaction: 0,
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0
  };

  quickActions: QuickAction[] = [
    { 
      id: 'newMaintenance', 
      title: 'New Maintenance', 
      description: 'Create maintenance request', 
      icon: 'add_task', 
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
      icon: 'payments', 
      color: '#ff6b35', 
      action: () => this.processDeposit() 
    },
    { 
      id: 'contactTenant', 
      title: 'Contact Tenant', 
      description: 'Message tenant', 
      icon: 'message', 
      color: '#6f42c1', 
      action: () => this.contactTenant() 
    }
  ];

  constructor(
    private caretakerService: CaretakerService,
    private profilePictureService: ProfilePictureService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.checkMobileView();
    this.loadDashboardData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadProperties(),
      this.loadUnits()
    ]).then(() => {
      this.calculateStatistics();
      this.generateRecentActivities();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.calculateStatistics();
      this.generateRecentActivities();
      this.loading = false;
    });
  }

  loadProperties(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.caretakerService.getProperties().subscribe({
        next: (properties) => {
          this.properties = properties;
          resolve();
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.properties = [];
          resolve();
        }
      });
    });
  }

  loadUnits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.caretakerService.getAllUnits().subscribe({
        next: (units) => {
          this.units = units;
          resolve();
        },
        error: (error) => {
          console.error('Error loading units:', error);
          this.units = [];
          resolve();
        }
      });
    });
  }

  calculateStatistics(): void {
    this.stats.totalProperties = this.properties.length;
    this.stats.totalUnits = this.units.length;
    this.stats.occupiedUnits = this.units.filter(unit => unit.isOccupied).length;
    this.stats.vacantUnits = this.stats.totalUnits - this.stats.occupiedUnits;
    this.stats.pendingMaintenance = 5;
    this.stats.scheduledInspections = 3;
    this.stats.completedJobs = 12;
    this.stats.responseRate = 92;
    this.stats.tenantSatisfaction = 4.5;
  }

  generateRecentActivities(): void {
    this.recentActivities = [
      {
        id: '1',
        type: 'maintenance',
        title: 'Maintenance Request Submitted',
        details: 'Kitchen sink leakage - Unit 4B',
        time: '2 hours ago'
      },
      {
        id: '2',
        type: 'inspection',
        title: 'Inspection Completed',
        details: 'Routine check - Block A',
        time: '5 hours ago'
      },
      {
        id: '3',
        type: 'maintenance',
        title: 'Maintenance Completed',
        details: 'AC repair - Unit 2A',
        time: '1 day ago'
      }
    ];
  }

  get isProfileView(): boolean {
    return ['profile-view', 'profile-edit', 'profile'].includes(this.currentView);
  }

  isActiveView(viewId: string): boolean {
    if (viewId === 'profile') {
      return this.isProfileView;
    }
    return this.currentView === viewId;
  }

  getPageTitle(): string {
    const titleMap: { [key: string]: string } = {
      'overview': 'Dashboard Overview',
      'profile-view': 'My Profile',
      'profile-edit': 'Edit Profile',
      'profile': 'My Profile',
      'maintenance': 'Maintenance Management',
      'inspections': 'Property Inspections',
      'deposits': 'Deposit Management',
      'properties': 'Properties',
      'messages': 'Messages',
      'reports': 'Reports & Analytics'
    };
    return titleMap[this.currentView] || this.currentView;
  }

  getSectionTitle(): string {
    const titleMap: { [key: string]: string } = {
      'maintenance': 'Maintenance Management',
      'inspections': 'Property Inspections',
      'deposits': 'Deposit Management',
      'properties': 'Property Portfolio',
      'messages': 'Communication Center',
      'reports': 'Reports & Analytics'
    };
    return titleMap[this.currentView] || this.currentView;
  }

  getSectionDescription(): string {
    const descMap: { [key: string]: string } = {
      'maintenance': 'Manage and track maintenance requests across all properties',
      'inspections': 'Schedule and conduct property inspections',
      'deposits': 'Handle security deposit transactions and disputes',
      'properties': 'Overview of all managed properties and units',
      'messages': 'Communicate with tenants and property owners',
      'reports': 'Generate reports and view analytics'
    };
    return descMap[this.currentView] || `Manage your ${this.currentView.toLowerCase()} activities`;
  }

  checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  closeMobileMenu(): void {
    if (this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  setView(view: string): void {
    this.currentView = view;
    if (this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  loadUserProfile(): void {
    this.profilePictureService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.determineActualUserRole();
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.determineActualUserRole();
        this.userProfile = {
          id: 'unknown',
          fullName: this.getRoleDisplay(),
          email: '',
          role: this.userRole,
          verified: false,
          emailVerified: false
        };
      }
    });
  }

  private determineActualUserRole(): void {
    if (this.authService.isTenant()) {
      this.userRole = 'tenant';
    } else if (this.authService.isCaretaker()) {
      this.userRole = 'caretaker';
    } else if (this.authService.isLandlord()) {
      this.userRole = 'landlord';
    } else if (this.authService.isBusiness()) {
      this.userRole = 'business';
    } else if (this.authService.isAdmin()) {
      this.userRole = 'admin';
    } else {
      this.userRole = 'caretaker';
    }

    if (this.userProfile) {
      this.userProfile = {
        ...this.userProfile,
        role: this.userRole
      };
    }
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
    return roleMap[this.userRole] || 'Caretaker';
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
    return colorMap[this.userRole] || '#2196F3';
  }

  onPictureUpdated(imageUrl: string): void {
    if (this.userProfile) {
      this.userProfile.profilePicture = imageUrl;
    }
  }

  onPictureDeleted(): void {
    if (this.userProfile) {
      this.userProfile.profilePicture = undefined;
    }
  }

  handleEditProfile(): void {
    this.currentView = 'profile-edit';
  }

  handleViewProfile(): void {
    this.currentView = 'profile-view';
  }

  handleGoBackFromProfile(): void {
    this.currentView = 'overview';
  }

  createMaintenance(): void {
    this.setView('maintenance');
  }

  scheduleInspection(): void {
    this.setView('inspections');
  }

  processDeposit(): void {
    this.setView('deposits');
  }

  contactTenant(): void {
    this.setView('messages');
  }

  refreshData(): void {
    this.loadDashboardData();
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
}