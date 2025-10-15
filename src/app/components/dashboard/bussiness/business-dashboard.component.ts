import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

interface BusinessStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

interface Job {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  dateRequested: string;
  tenantName: string;
  property: string;
  quoteAmount: number;
  scheduledDate: string;
}

interface Earnings {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
  status: 'pending' | 'paid';
}

interface Review {
  id: string;
  tenantName: string;
  rating: number;
  comment: string;
  date: string;
  jobTitle: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent implements OnInit {
  currentView: string = 'overview';
  isSidebarOpen = true;
  
  stats: BusinessStats = {
    totalJobs: 67,
    completedJobs: 45,
    pendingJobs: 8,
    totalEarnings: 287500,
    averageRating: 4.5,
    responseRate: 95
  };

  jobs: Job[] = [
    { id: '1', title: 'Kitchen faucet repair', category: 'Plumbing', priority: 'medium', description: 'Fix leaking kitchen faucet', status: 'accepted', dateRequested: '2024-03-01', tenantName: 'John Doe', property: 'Apartment 4B', quoteAmount: 3500, scheduledDate: '2024-03-03' },
    { id: '2', title: 'AC maintenance', category: 'HVAC', priority: 'high', description: 'AC not cooling properly', status: 'in-progress', dateRequested: '2024-02-28', tenantName: 'Sarah Smith', property: 'House 12', quoteAmount: 8000, scheduledDate: '2024-03-02' },
    { id: '3', title: 'Electrical wiring', category: 'Electrical', priority: 'urgent', description: 'Kitchen outlet sparking', status: 'pending', dateRequested: '2024-03-02', tenantName: 'Mike Johnson', property: 'Apartment 7C', quoteAmount: 12000, scheduledDate: '2024-03-04' },
    { id: '4', title: 'Window lock repair', category: 'General Repairs', priority: 'low', description: 'Fix bedroom window lock', status: 'completed', dateRequested: '2024-02-25', tenantName: 'Alice Brown', property: 'House 8', quoteAmount: 2500, scheduledDate: '2024-02-26' }
  ];

  earnings: Earnings[] = [
    { id: '1', jobId: '4', jobTitle: 'Window lock repair', amount: 2500, commission: 250, netAmount: 2250, date: '2024-02-28', status: 'paid' },
    { id: '2', jobId: '5', jobTitle: 'Paint touch up', amount: 15000, commission: 1500, netAmount: 13500, date: '2024-02-25', status: 'paid' },
    { id: '3', jobId: '6', jobTitle: 'Furniture assembly', amount: 8000, commission: 800, netAmount: 7200, date: '2024-02-20', status: 'paid' },
    { id: '4', jobId: '1', jobTitle: 'Kitchen faucet repair', amount: 3500, commission: 350, netAmount: 3150, date: '2024-03-05', status: 'pending' }
  ];

  reviews: Review[] = [
    { id: '1', tenantName: 'John Doe', rating: 5, comment: 'Excellent service, fixed the issue quickly!', date: '2024-02-28', jobTitle: 'Plumbing repair' },
    { id: '2', tenantName: 'Sarah Smith', rating: 4, comment: 'Good work, but arrived 30 minutes late', date: '2024-02-25', jobTitle: 'AC maintenance' },
    { id: '3', tenantName: 'Mike Johnson', rating: 5, comment: 'Professional and efficient service', date: '2024-02-20', jobTitle: 'Electrical work' },
    { id: '4', tenantName: 'Alice Brown', rating: 4, comment: 'Quality work, fair pricing', date: '2024-02-15', jobTitle: 'General repairs' }
  ];

  quickActions: QuickAction[] = [
    { id: 'viewJobs', title: 'View Jobs', description: 'Check available jobs', icon: 'work', color: '#007bff', action: () => this.setView('jobs') },
    { id: 'updateProfile', title: 'Update Profile', description: 'Edit business info', icon: 'business', color: '#28a745', action: () => this.updateProfile() },
    { id: 'viewEarnings', title: 'View Earnings', description: 'Check payments', icon: 'payments', color: '#ffc107', action: () => this.setView('earnings') },
    { id: 'addService', title: 'Add Service', description: 'New service offering', icon: 'add_circle', color: '#17a2b8', action: () => this.addService() }
  ];

  navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'jobs', label: 'Jobs', icon: 'work' },
    { id: 'earnings', label: 'Earnings', icon: 'payments' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'profile', label: 'Profile', icon: 'business' },
    { id: 'services', label: 'Services', icon: 'build' },
    { id: 'messages', label: 'Messages', icon: 'chat' }
  ];

  displayedJobColumns: string[] = ['title', 'category', 'priority', 'status', 'tenantName', 'quoteAmount', 'scheduledDate', 'actions'];
  displayedEarningColumns: string[] = ['jobTitle', 'amount', 'commission', 'netAmount', 'date', 'status', 'actions'];
  displayedReviewColumns: string[] = ['tenantName', 'rating', 'comment', 'jobTitle', 'date'];

  ngOnInit(): void {
    this.loadBusinessData();
  }

  loadBusinessData(): void {
    console.log('Loading business data...');
  }

  setView(view: string): void {
    this.currentView = view;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  updateProfile(): void {
    console.log('Updating business profile...');
  }

  addService(): void {
    console.log('Adding new service...');
  }

  acceptJob(job: Job): void {
    job.status = 'accepted';
  }

  startJob(job: Job): void {
    job.status = 'in-progress';
  }

  completeJob(job: Job): void {
    job.status = 'completed';
  }

  rejectJob(job: Job): void {
    job.status = 'cancelled';
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
      'accepted': 'status-accepted',
      'in-progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'paid': 'status-paid'
    };
    return statusMap[status] || 'status-pending';
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

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getPendingJobsCount(): number {
    return this.jobs.filter(job => job.status === 'pending').length;
  }

  getInProgressJobsCount(): number {
    return this.jobs.filter(job => job.status === 'in-progress').length;
  }

  getCompletedJobsCount(): number {
    return this.jobs.filter(job => job.status === 'completed').length;
  }

  getTotalRevenue(): number {
    return this.earnings.reduce((sum, earning) => sum + earning.amount, 0);
  }

  getTotalCommission(): number {
    return this.earnings.reduce((sum, earning) => sum + earning.commission, 0);
  }

  getNetEarnings(): number {
    return this.earnings.reduce((sum, earning) => sum + earning.netAmount, 0);
  }

  getPendingEarningsCount(): number {
    return this.earnings.filter(earning => earning.status === 'pending').length;
  }

  getPaidEarningsCount(): number {
    return this.earnings.filter(earning => earning.status === 'paid').length;
  }

  getRecentJobs(): Job[] {
    return this.jobs.slice(0, 3);
  }

  getRecentReviews(): Review[] {
    return this.reviews.slice(0, 3);
  }

  getJobsByStatus(status: string): Job[] {
    return this.jobs.filter(job => job.status === status);
  }

  getEarningsByStatus(status: string): Earnings[] {
    return this.earnings.filter(earning => earning.status === status);
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / this.reviews.length;
  }

  getTotalJobsCount(): number {
    return this.jobs.length;
  }

  getTotalEarningsAmount(): number {
    return this.earnings.reduce((sum, earning) => sum + earning.netAmount, 0);
  }

  refreshData(): void {
    this.loadBusinessData();
  }

  logout(): void {
    console.log('Business logging out...');
  }
}