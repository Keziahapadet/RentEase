import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

interface AdminDashboardStats {
  totalUsers: number;
  activeTenants: number;
  activeLandlords: number;
  activeCaretakers: number;
  activeBusinesses: number;
  pendingVerifications: number;
  pendingBusinessApprovals: number;
  escrowBalance: number;
  monthlyRevenue: number;
  businessCommissions: number;
  activeDisputes: number;
  reportedIssues: number;
  businessComplaints: number;
  totalServiceRequests: number;
  completedServices: number;
  averageBusinessRating: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'dispute' | 'business_signup' | 'service_request' | 'review' | 'payment';
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'in_progress';
}

interface PendingApproval {
  id: string;
  type: 'user' | 'business' | 'document' | 'listing';
  name: string;
  email: string;
  submittedDate: Date;
  category?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatListModule,
    MatExpansionModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isSidebarCollapsed = false;
  
  stats: AdminDashboardStats = {
    totalUsers: 1247,
    activeTenants: 523,
    activeLandlords: 189,
    activeCaretakers: 67,
    activeBusinesses: 468,
    pendingVerifications: 23,
    pendingBusinessApprovals: 15,
    escrowBalance: 12450000,
    monthlyRevenue: 2340000,
    businessCommissions: 890000,
    activeDisputes: 8,
    reportedIssues: 12,
    businessComplaints: 5,
    totalServiceRequests: 342,
    completedServices: 298,
    averageBusinessRating: 4.6
  };

  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      description: 'New landlord registration: John Kamau',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      priority: 'low',
      status: 'pending'
    },
    {
      id: '2',
      type: 'dispute',
      description: 'Deposit dispute raised by tenant Mary Wanjiku',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      priority: 'high',
      status: 'in_progress'
    },
    {
      id: '3',
      type: 'business_signup',
      description: 'New business application: ABC Plumbing Services',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      priority: 'medium',
      status: 'pending'
    },
    {
      id: '4',
      type: 'service_request',
      description: 'Service request completed by QuickFix Plumbing',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      priority: 'low',
      status: 'resolved'
    },
    {
      id: '5',
      type: 'review',
      description: 'Negative review reported: Jane Doe vs Property XYZ',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      priority: 'medium',
      status: 'pending'
    }
  ];

  pendingApprovals: PendingApproval[] = [
    {
      id: '1',
      type: 'business',
      name: 'QuickFix Plumbing',
      email: 'info@quickfix.com',
      submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      category: 'Plumbing Services'
    },
    {
      id: '2',
      type: 'user',
      name: 'Peter Ochieng',
      email: 'peter.o@email.com',
      submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
      category: 'Landlord'
    },
    {
      id: '3',
      type: 'business',
      name: 'CleanPro Services',
      email: 'contact@cleanpro.co.ke',
      submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
      category: 'Cleaning Services'
    },
    {
      id: '4',
      type: 'document',
      name: 'Lease Agreement - Westlands Apartment',
      email: 'landlord@example.com',
      submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 3),
      category: 'Lease Document'
    }
  ];

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-KE');
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'user_registration': 'person_add',
      'dispute': 'gavel',
      'business_signup': 'store',
      'service_request': 'build',
      'review': 'star',
      'payment': 'payment'
    };
    return icons[type] || 'info';
  }

  getApprovalColor(type: string): string {
    const colors: { [key: string]: string } = {
      'user': 'primary',
      'business': 'accent',
      'document': 'warn',
      'listing': ''
    };
    return colors[type] || '';
  }

  // Navigation methods
  viewReports() { 
    this.router.navigate(['/admin/reports']); 
  }

  viewPendingApprovals() { 
    this.router.navigate(['/admin/approvals']); 
  }

  viewDisputes() { 
    this.router.navigate(['/admin/disputes']); 
  }

  manageUsers() { 
    this.router.navigate(['/admin/users']); 
  }

  manageBusinesses() { 
    this.router.navigate(['/admin/businesses']); 
  }

  reviewDocuments() { 
    this.router.navigate(['/admin/documents']); 
  }

  moderateContent() { 
    this.router.navigate(['/admin/moderation']); 
  }

  manageEscrow() { 
    this.router.navigate(['/admin/escrow']); 
  }

  viewAnalytics() { 
    this.router.navigate(['/admin/analytics']); 
  }

  exportData() { 
    this.snackBar.open('Exporting dashboard data...', 'Close', { duration: 3000 });
    // Implement export logic
  }

  settings() { 
    this.router.navigate(['/admin/settings']); 
  }

  // Action methods
  approveItem(approval: PendingApproval) {
    this.snackBar.open(`Approving ${approval.name}...`, 'Close', { duration: 2000 });
    
    // Remove from pending list
    this.pendingApprovals = this.pendingApprovals.filter(item => item.id !== approval.id);
    
    // Update stats
    if (approval.type === 'business') {
      this.stats.pendingBusinessApprovals--;
      this.stats.activeBusinesses++;
    } else if (approval.type === 'user') {
      this.stats.pendingVerifications--;
    }
  }

  rejectItem(approval: PendingApproval) {
    this.snackBar.open(`Rejecting ${approval.name}...`, 'Close', { duration: 2000 });
    
    // Remove from pending list
    this.pendingApprovals = this.pendingApprovals.filter(item => item.id !== approval.id);
    
    // Update stats
    if (approval.type === 'business') {
      this.stats.pendingBusinessApprovals--;
    } else if (approval.type === 'user') {
      this.stats.pendingVerifications--;
    }
  }

  viewDetails(approval: PendingApproval) {
    this.router.navigate(['/admin/approvals', approval.id]);
  }

  refreshDashboard() {
    this.isLoading = true;
    this.loadDashboardData();
  }
}