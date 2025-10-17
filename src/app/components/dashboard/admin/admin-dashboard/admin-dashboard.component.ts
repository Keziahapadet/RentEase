import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { UsersViewComponent } from './components/users-view/users-view.component';
import { PropertiesViewComponent } from './components/properties-view/properties-view.component';
import { DisputesViewComponent } from './components/disputes-view/disputes-view.component';
import { AdminStats, NavItem, Activity, ChartData, Notification } from '../../../../models/dashboard.model';
import { EnhancedUser } from '../../../../models/user.model';
import { Property } from '../../../../models/property.model';
import { Business } from '../../../../models/bussiness.model';
import { Dispute, Transaction } from '../../../../models/transaction.model';
import { BusinessesViewComponent } from './components/bussiness-view/businesses-view.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDividerModule,
    UsersViewComponent,
    PropertiesViewComponent,
    BusinessesViewComponent,
    DisputesViewComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentView: string = 'overview';
  isSidebarOpen = true;
  isDarkMode = false;
  isMobileMenuOpen = false;
  searchQuery = '';
  isLoading = false;
  
  stats: AdminStats = {
    totalUsers: 1250,
    totalLandlords: 45,
    totalTenants: 980,
    totalCaretakers: 25,
    totalProperties: 120,
    landlordTenants: 850,
    activeBusinesses: 85,
    monthlyTransactions: 4200000,
    commissionRevenue: 420000,
    pendingApprovals: 12,
    activeDisputes: 8,
    userGrowth: 12.5,
    revenueGrowth: 18.3,
    propertiesGrowth: 8.7
  };

  recentActivities: Activity[] = [
    {
      id: '1',
      type: 'user',
      action: 'New User Registration',
      description: 'John Doe registered as a tenant',
      timestamp: '5 minutes ago',
      icon: 'person_add'
    },
    {
      id: '2',
      type: 'business',
      action: 'Business Approval',
      description: 'Quick Clean business was approved',
      timestamp: '15 minutes ago',
      icon: 'check_circle'
    },
    {
      id: '3',
      type: 'transaction',
      action: 'Payment Received',
      description: 'KSH 35,000 rent payment received',
      timestamp: '1 hour ago',
      icon: 'payment'
    },
    {
      id: '4',
      type: 'dispute',
      action: 'Dispute Resolved',
      description: 'Deposit dispute resolved between Tenant A and Landlord B',
      timestamp: '2 hours ago',
      icon: 'gavel'
    },
    {
      id: '5',
      type: 'property',
      action: 'Property Added',
      description: 'New property "City Heights" added to the system',
      timestamp: '3 hours ago',
      icon: 'apartment'
    }
  ];

  monthlyRevenueData: ChartData[] = [
    { label: 'Jan', value: 320000 },
    { label: 'Feb', value: 350000 },
    { label: 'Mar', value: 420000 },
    { label: 'Apr', value: 380000 },
    { label: 'May', value: 450000 },
    { label: 'Jun', value: 420000 }
  ];

  userTypeDistribution: ChartData[] = [
    { label: 'Tenants', value: 980 },
    { label: 'Landlords', value: 45 },
    { label: 'Caretakers', value: 25 }
  ];

  notifications: Notification[] = [
    { 
      id: 1, 
      message: '12 pending business approvals', 
      unread: true
    },
    { 
      id: 2, 
      message: '8 active disputes require attention', 
      unread: true
    },
    { 
      id: 3, 
      message: 'Monthly report is ready', 
      unread: false
    }
  ];

  enhancedUsers: EnhancedUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@email.com',
      type: 'tenant',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      rentalProperty: 'Sunset Apartments - Unit 4B',
      landlordName: 'Sarah Smith',
      caretakerName: 'Mike Johnson',
      rentAmount: 35000,
      leaseEndDate: '2024-12-31'
    },
    {
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@email.com',
      type: 'landlord',
      status: 'active',
      joinDate: '2024-01-20',
      lastActive: '1 day ago',
      companyName: 'Smith Properties Ltd',
      propertiesCount: 8,
      tenantsCount: 15,
      caretakersCount: 3,
      totalRevenue: 425000
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@email.com',
      type: 'caretaker',
      status: 'active',
      joinDate: '2024-02-01',
      lastActive: '30 minutes ago',
      managedPropertiesCount: 12,
      landlordsCount: 4,
      activeMaintenance: 3,
      specialization: 'Plumbing & Electrical',
      rating: 4.8
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@email.com',
      type: 'tenant',
      status: 'inactive',
      joinDate: '2024-02-15',
      rentalProperty: 'Garden Villas - Unit 2C',
      landlordName: 'David Wilson',
      caretakerName: 'Not assigned'
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david@email.com',
      type: 'landlord',
      status: 'active',
      joinDate: '2024-01-25',
      lastActive: '3 hours ago',
      companyName: 'Wilson Real Estate',
      propertiesCount: 15,
      tenantsCount: 28,
      caretakersCount: 5,
      totalRevenue: 780000
    }
  ];

  properties: Property[] = [
    {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Sunset Blvd, Nairobi',
      location: '123 Sunset Blvd, Nairobi',
      type: 'Apartment Building',
      propertyType: 'apartment',
      unitsCount: 12,
      totalUnits: 12,
      status: 'occupied',
      landlordId: '2',
      landlordName: 'Sarah Smith',
      landlordEmail: 'sarah@email.com',
      landlordPropertiesCount: 8,
      caretakerId: '3',
      caretakerName: 'Mike Johnson',
      caretakerEmail: 'mike@email.com',
      caretakerRating: 4.8,
      tenantsCount: 10,
      occupiedUnits: 10,
      monthlyRevenue: 425000,
      tenants: [
        {
          id: '1',
          name: 'John Doe',
          unitNumber: '4B',
          email: 'john@email.com',
          phone: '+254712345678',
          rentAmount: 35000,
          leaseEndDate: '2024-12-31'
        },
        {
          id: '6',
          name: 'Emma Wilson',
          unitNumber: '3A',
          email: 'emma@email.com',
          phone: '+254723456789',
          rentAmount: 32000,
          leaseEndDate: '2024-11-30'
        }
      ]
    },
    {
      id: '2',
      name: 'Garden Villas',
      address: '456 Garden Road, Westlands',
      location: '456 Garden Road, Westlands',
      type: 'Townhouses',
      propertyType: 'townhouse',
      unitsCount: 8,
      totalUnits: 8,
      status: 'occupied',
      landlordId: '5',
      landlordName: 'David Wilson',
      landlordEmail: 'david@email.com',
      landlordPropertiesCount: 15,
      caretakerId: '3',
      caretakerName: 'Mike Johnson',
      caretakerEmail: 'mike@email.com',
      caretakerRating: 4.8,
      tenantsCount: 6,
      occupiedUnits: 6,
      monthlyRevenue: 270000,
      tenants: [
        {
          id: '4',
          name: 'Alice Brown',
          unitNumber: '2C',
          email: 'alice@email.com',
          phone: '+254734567890',
          rentAmount: 45000,
          leaseEndDate: '2024-10-15'
        }
      ]
    },
    {
      id: '3',
      name: 'City Heights',
      address: '789 City Center, CBD',
      location: '789 City Center, CBD',
      type: 'Commercial Building',
      propertyType: 'commercial',
      unitsCount: 20,
      totalUnits: 20,
      status: 'vacant',
      landlordId: '2',
      landlordName: 'Sarah Smith',
      landlordEmail: 'sarah@email.com',
      landlordPropertiesCount: 8,
      tenantsCount: 0,
      occupiedUnits: 0,
      monthlyRevenue: 0,
      tenants: []
    }
  ];

  businesses: Business[] = [
    { 
      id: '1', 
      name: 'Joe Plumbing', 
      category: 'Plumbing', 
      status: 'approved', 
      registrationDate: '2024-01-15', 
      rating: 4.5, 
      totalJobs: 45
    },
    { 
      id: '2', 
      name: 'City Furniture', 
      category: 'Furniture', 
      status: 'approved', 
      registrationDate: '2024-01-10', 
      rating: 4.2, 
      totalJobs: 28
    },
    { 
      id: '3', 
      name: 'Quick Clean', 
      category: 'Cleaning', 
      status: 'pending', 
      registrationDate: '2024-03-01', 
      rating: 0, 
      totalJobs: 0
    },
    { 
      id: '4', 
      name: 'Safe Movers', 
      category: 'Moving', 
      status: 'pending', 
      registrationDate: '2024-03-02', 
      rating: 0, 
      totalJobs: 0
    },
    { 
      id: '5', 
      name: 'Power Electric', 
      category: 'Electrical', 
      status: 'approved', 
      registrationDate: '2024-02-01', 
      rating: 4.8, 
      totalJobs: 67
    }
  ];

  disputes: Dispute[] = [
    { 
      id: '1', 
      type: 'deposit', 
      parties: ['Tenant A', 'Landlord B'], 
      amount: 5000, 
      status: 'pending', 
      createdDate: '2024-03-01'
    },
    { 
      id: '2', 
      type: 'service', 
      parties: ['Tenant C', 'Quick Clean'], 
      amount: 3000, 
      status: 'pending', 
      createdDate: '2024-03-02'
    },
    { 
      id: '3', 
      type: 'payment', 
      parties: ['Business X', 'Platform'], 
      amount: 1500, 
      status: 'resolved', 
      createdDate: '2024-02-28'
    }
  ];

  transactions: Transaction[] = [
    { 
      id: '1', 
      type: 'commission', 
      amount: 2500, 
      business: 'Joe Plumbing', 
      date: '2024-03-01', 
      status: 'completed'
    },
    { 
      id: '2', 
      type: 'deposit', 
      amount: 50000, 
      business: 'N/A', 
      date: '2024-03-01', 
      status: 'completed'
    },
    { 
      id: '3', 
      type: 'commission', 
      amount: 1800, 
      business: 'City Furniture', 
      date: '2024-03-02', 
      status: 'completed'
    },
    { 
      id: '4', 
      type: 'payment', 
      amount: 35000, 
      business: 'Safe Movers', 
      date: '2024-03-02', 
      status: 'pending'
    }
  ];

  navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'properties', label: 'Properties', icon: 'apartment' },
    { id: 'businesses', label: 'Businesses', icon: 'business' },
    { id: 'disputes', label: 'Disputes', icon: 'gavel' },
    { id: 'transactions', label: 'Transactions', icon: 'payments' },
    { id: 'reports', label: 'Reports', icon: 'assessment' }
  ];

  filteredUsers: EnhancedUser[] = [];
  selectedUserType: string = 'all';
  selectedStatus: string = 'all';

  displayedTransactionColumns: string[] = ['type', 'business', 'amount', 'date', 'status', 'actions'];

  ngOnInit(): void {
    this.filteredUsers = [...this.enhancedUsers];
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  setView(view: string): void {
    this.currentView = view;
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
    if (view === 'users') {
      this.selectedUserType = 'all';
      this.selectedStatus = 'all';
      this.filterUsers();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  filterUsers(): void {
    this.filteredUsers = this.enhancedUsers.filter(user => {
      const typeMatch = this.selectedUserType === 'all' || user.type === this.selectedUserType;
      const statusMatch = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      return typeMatch && statusMatch;
    });
  }

  viewUserDetails(user: EnhancedUser): void {
    console.log('View user details:', user);
  }

  editUser(user: EnhancedUser): void {
    console.log('Edit user:', user);
  }

  suspendUser(user: EnhancedUser): void {
    user.status = 'suspended';
    console.log('User suspended:', user);
  }

  activateUser(user: EnhancedUser): void {
    user.status = 'active';
    console.log('User activated:', user);
  }

  viewPropertyDetails(property: Property): void {
    console.log('View property details:', property);
  }

  editProperty(property: Property): void {
    console.log('Edit property:', property);
  }

  approveBusiness(business: Business): void {
    business.status = 'approved';
    this.stats.pendingApprovals--;
    console.log('Business approved:', business);
  }

  rejectBusiness(business: Business): void {
    business.status = 'rejected';
    this.stats.pendingApprovals--;
    console.log('Business rejected:', business);
  }

  resolveDispute(dispute: Dispute): void {
    dispute.status = 'resolved';
    this.stats.activeDisputes--;
    console.log('Dispute resolved:', dispute);
  }

  viewTransactionDetails(transaction: Transaction): void {
    console.log('View transaction details:', transaction);
  }

  generateReport(reportType: string): void {
    console.log('Generating report:', reportType);
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Report generated successfully');
    }, 2000);
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-KE');
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'suspended': 'status-suspended',
      'pending': 'status-pending',
      'resolved': 'status-resolved',
      'escalated': 'status-escalated',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'occupied': 'status-occupied',
      'vacant': 'status-vacant',
      'maintenance': 'status-maintenance',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  }

  getPropertyStatusClass(status: string): string {
    const statusMap: any = {
      'occupied': 'status-occupied',
      'vacant': 'status-vacant',
      'maintenance': 'status-maintenance'
    };
    return statusMap[status] || 'status-vacant';
  }

  getOccupiedPropertiesCount(): number {
    return this.properties.filter(property => property.status === 'occupied').length;
  }

  getVacantPropertiesCount(): number {
    return this.properties.filter(property => property.status === 'vacant').length;
  }

  getTotalUsersCount(): number {
    return this.enhancedUsers.length;
  }

  getTenantsCount(): number {
    return this.enhancedUsers.filter(u => u.type === 'tenant').length;
  }

  getLandlordsCount(): number {
    return this.enhancedUsers.filter(u => u.type === 'landlord').length;
  }

  getCaretakersCount(): number {
    return this.enhancedUsers.filter(u => u.type === 'caretaker').length;
  }

  exportData(format: string): void {
    console.log(`Exporting data as ${format}`);
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log(`Data exported as ${format} successfully`);
    }, 1500);
  }

  refreshData(): void {
    this.loadAdminData();
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  markNotificationAsRead(notification: Notification): void {
    notification.unread = false;
    console.log('Notification marked as read:', notification);
  }

  logout(): void {
    console.log('Admin logging out...');
  }

  getMaxChartValue(): number {
    return Math.max(...this.monthlyRevenueData.map(d => d.value));
  }

  getChartBarHeight(value: number): number {
    return (value / this.getMaxChartValue()) * 100;
  }

  viewLandlords(): void {
    this.setView('users');
    this.selectedUserType = 'landlord';
    this.filterUsers();
  }

  viewTenants(): void {
    this.setView('users');
    this.selectedUserType = 'tenant';
    this.filterUsers();
  }

  viewCaretakers(): void {
    this.setView('users');
    this.selectedUserType = 'caretaker';
    this.filterUsers();
  }

  viewLandlordProperties(): void {
    this.setView('properties');
  }

  viewLandlordTenants(): void {
    this.setView('users');
    this.selectedUserType = 'tenant';
    this.filterUsers();
  }

  getCompletedTransactionsCount(): number {
    return this.transactions.filter(transaction => transaction.status === 'completed').length;
  }

  navigateToSection(section: string): void {
    this.setView(section);
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}