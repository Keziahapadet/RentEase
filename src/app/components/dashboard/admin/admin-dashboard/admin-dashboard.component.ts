import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

interface DashboardStats {
  totalUsers: number;
  activeBusinesses: number;
  monthlyTransactions: number;
  commissionRevenue: number;
  pendingApprovals: number;
  activeDisputes: number;
}

interface Business {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  rating: number;
  totalJobs: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: 'tenant' | 'landlord' | 'caretaker';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
}

interface Dispute {
  id: string;
  type: 'deposit' | 'service' | 'payment';
  parties: string[];
  amount: number;
  status: 'pending' | 'resolved' | 'escalated';
  createdDate: string;
}

interface Transaction {
  id: string;
  type: 'commission' | 'deposit' | 'payment';
  amount: number;
  business: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentView: string = 'overview';
  isSidebarOpen = true;
  
  stats: DashboardStats = {
    totalUsers: 1250,
    activeBusinesses: 85,
    monthlyTransactions: 4200000,
    commissionRevenue: 420000,
    pendingApprovals: 12,
    activeDisputes: 8
  };

  businesses: Business[] = [
    { id: '1', name: 'Joe Plumbing', category: 'Plumbing', status: 'approved', registrationDate: '2024-01-15', rating: 4.5, totalJobs: 45 },
    { id: '2', name: 'City Furniture', category: 'Furniture', status: 'approved', registrationDate: '2024-01-10', rating: 4.2, totalJobs: 28 },
    { id: '3', name: 'Quick Clean', category: 'Cleaning', status: 'pending', registrationDate: '2024-03-01', rating: 0, totalJobs: 0 },
    { id: '4', name: 'Safe Movers', category: 'Moving', status: 'pending', registrationDate: '2024-03-02', rating: 0, totalJobs: 0 },
    { id: '5', name: 'Power Electric', category: 'Electrical', status: 'approved', registrationDate: '2024-02-01', rating: 4.8, totalJobs: 67 }
  ];

  users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@email.com', type: 'tenant', status: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Sarah Smith', email: 'sarah@email.com', type: 'landlord', status: 'active', joinDate: '2024-01-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@email.com', type: 'caretaker', status: 'active', joinDate: '2024-02-01' },
    { id: '4', name: 'Alice Brown', email: 'alice@email.com', type: 'tenant', status: 'inactive', joinDate: '2024-02-15' }
  ];

  disputes: Dispute[] = [
    { id: '1', type: 'deposit', parties: ['Tenant A', 'Landlord B'], amount: 5000, status: 'pending', createdDate: '2024-03-01' },
    { id: '2', type: 'service', parties: ['Tenant C', 'Quick Clean'], amount: 3000, status: 'pending', createdDate: '2024-03-02' },
    { id: '3', type: 'payment', parties: ['Business X', 'Platform'], amount: 1500, status: 'resolved', createdDate: '2024-02-28' }
  ];

  transactions: Transaction[] = [
    { id: '1', type: 'commission', amount: 2500, business: 'Joe Plumbing', date: '2024-03-01', status: 'completed' },
    { id: '2', type: 'deposit', amount: 50000, business: 'N/A', date: '2024-03-01', status: 'completed' },
    { id: '3', type: 'commission', amount: 1800, business: 'City Furniture', date: '2024-03-02', status: 'completed' },
    { id: '4', type: 'payment', amount: 35000, business: 'Safe Movers', date: '2024-03-02', status: 'pending' }
  ];

  alerts = [
    { type: 'warning', message: '3 businesses with rating below 3.0', count: 3 },
    { type: 'warning', message: '2 deposit disputes awaiting decision', count: 2 },
    { type: 'warning', message: '5 maintenance requests >48hrs pending', count: 5 },
    { type: 'success', message: 'All systems operational', count: 0 }
  ];

  displayedBusinessColumns: string[] = ['name', 'category', 'status', 'rating', 'totalJobs', 'actions'];
  displayedUserColumns: string[] = ['name', 'email', 'type', 'status', 'joinDate', 'actions'];
  displayedDisputeColumns: string[] = ['type', 'parties', 'amount', 'status', 'createdDate', 'actions'];
  displayedTransactionColumns: string[] = ['type', 'business', 'amount', 'date', 'status', 'actions'];

  navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'businesses', label: 'Businesses', icon: 'business' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'disputes', label: 'Disputes', icon: 'gavel' },
    { id: 'transactions', label: 'Transactions', icon: 'payments' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Loading admin dashboard data...');
  }

  setView(view: string): void {
    this.currentView = view;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  approveBusiness(business: Business): void {
    business.status = 'approved';
    this.stats.pendingApprovals--;
  }

  rejectBusiness(business: Business): void {
    business.status = 'rejected';
    this.stats.pendingApprovals--;
  }

  resolveDispute(dispute: Dispute): void {
    dispute.status = 'resolved';
    this.stats.activeDisputes--;
  }

  suspendUser(user: User): void {
    user.status = 'suspended';
  }

  activateUser(user: User): void {
    user.status = 'active';
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-KE');
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'active': 'status-active',
      'inactive': 'status-inactive',
      'suspended': 'status-suspended',
      'resolved': 'status-resolved',
      'escalated': 'status-escalated',
      'completed': 'status-completed',
      'failed': 'status-failed'
    };
    return statusMap[status] || 'status-pending';
  }

  getAlertClass(alert: any): string {
    return alert.type === 'warning' ? 'alert-warning' : 'alert-success';
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  exportReport(): void {
    console.log('Exporting admin report...');
  }

  logout(): void {
    console.log('Admin logging out...');
  }
}