import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  description?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  icon: string;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit, OnChanges {
  // Input properties from parent component
  @Input() depositAmount!: number;
  @Input() rentAmount!: number;
  @Input() propertyAddress!: string;
  @Input() landlordName!: string;
  @Input() depositTimeline!: TimelineEvent[];
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  // Output events to parent component
  @Output() sectionToggle = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<string>();
  @Output() paymentClick = new EventEmitter<void>();
  
  // Component state
  recentActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'February rent payment received',
      description: 'Payment processed successfully via M-Pesa',
      time: '2 days ago',
      type: 'success',
      icon: 'check'
    },
    {
      id: '2',
      title: 'Maintenance request submitted',
      description: 'Kitchen faucet leaking issue reported',
      time: '5 days ago',
      type: 'info',
      icon: 'build'
    },
    {
      id: '3',
      title: 'Message from landlord',
      description: 'Monthly property inspection scheduled',
      time: '1 week ago',
      type: 'info',
      icon: 'mail'
    },
    {
      id: '4',
      title: 'Document uploaded',
      description: 'Insurance policy document added',
      time: '2 weeks ago',
      type: 'info',
      icon: 'description'
    }
  ];

  // Quick actions configuration
  quickActions = [
    {
      id: 'payment',
      title: 'Pay Rent',
      description: 'Make your monthly rent payment',
      icon: 'payment',
      color: '#10b981',
      action: () => this.makePayment()
    },
    {
      id: 'maintenance',
      title: 'Report Issue',
      description: 'Submit a maintenance request',
      icon: 'build',
      color: '#f59e0b',
      action: () => this.navigateToSection('maintenance')
    },
    {
      id: 'messages',
      title: 'Message',
      description: 'Contact your landlord',
      icon: 'message',
      color: '#3b82f6',
      action: () => this.navigateToSection('messages')
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Access your documents',
      icon: 'folder',
      color: '#8b5cf6',
      action: () => this.navigateToSection('documents')
    }
  ];

  // Computed properties
  get nextRentDueDate(): string {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    return nextMonth.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  get paymentStatus(): { status: string; daysLeft: number; className: string } {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), 15);
    
    if (today > dueDate) {
      const nextDue = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      return {
        status: 'Paid',
        daysLeft: Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        className: 'status-success'
      };
    } else {
      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: daysLeft > 5 ? 'Due Soon' : 'Due Very Soon',
        daysLeft: daysLeft,
        className: daysLeft > 5 ? 'status-warning' : 'status-danger'
      };
    }
  }

  ngOnInit(): void {
    this.validateInputs();
    this.loadDashboardData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['depositTimeline'] && this.depositTimeline) {
      this.updateTimelineProgress();
    }
  }

  // Validation methods
  private validateInputs(): void {
    if (!this.depositAmount || this.depositAmount <= 0) {
      console.warn('Invalid deposit amount provided to dashboard overview');
    }
    if (!this.rentAmount || this.rentAmount <= 0) {
      console.warn('Invalid rent amount provided to dashboard overview');
    }
    if (!this.propertyAddress) {
      console.warn('Property address not provided to dashboard overview');
    }
  }

  // Data loading methods
  private loadDashboardData(): void {
    // Load additional dashboard data if needed
    // This could include recent activities, notifications, etc.
    this.refreshActivities();
  }

  private refreshActivities(): void {
    // In a real application, this would fetch from a service
    // For now, we'll update timestamps to be more dynamic
    this.recentActivities = this.recentActivities.map(activity => ({
      ...activity,
      time: this.formatRelativeTime(activity.time)
    }));
  }

  private updateTimelineProgress(): void {
    // Update timeline completion status if needed
    if (this.depositTimeline) {
      const completedCount = this.depositTimeline.filter(event => event.completed).length;
      console.log(`Timeline progress: ${completedCount}/${this.depositTimeline.length} completed`);
    }
  }

  // Utility methods
  formatNumber(num: number): string {
    if (!num || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-KE').format(num);
  }

  formatCurrency(amount: number): string {
    if (!amount || isNaN(amount)) return 'KSH 0';
    return `KSH ${this.formatNumber(amount)}`;
  }

  getDepositStatusText(): string {
    return 'Secured & Protected';
  }
trackByActivityId(index: number, activity: any): string {
  return activity.id; // assuming each activity has a unique 'id'
}

  getActivityIconClass(type: string): string {
    const typeClasses = {
      'success': 'activity-success',
      'info': 'activity-info',
      'warning': 'activity-warning',
      'error': 'activity-error'
    };
    return typeClasses[type as keyof typeof typeClasses] || 'activity-info';
  }

  private formatRelativeTime(timeString: string): string {
    // Simple relative time formatting
    // In a real app, you might use a library like date-fns or moment.js
    return timeString;
  }

  // Section management methods
  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections?.has(sectionId) || false;
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections?.has(sectionId) || false;
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
  }

  // Navigation methods
  navigateToSection(section: string): void {
    console.log(`Navigating to section: ${section}`);
    this.actionClick.emit(section);
  }

  // Action methods
  makePayment(): void {
    console.log('Initiating payment from dashboard overview');
    this.paymentClick.emit();
  }

  viewDepositDetails(): void {
    this.navigateToSection('deposit');
  }

  viewPaymentHistory(): void {
    this.navigateToSection('payments');
  }

  // Timeline methods
  getTimelineCompletionPercentage(): number {
    if (!this.depositTimeline || this.depositTimeline.length === 0) return 0;
    
    const completedCount = this.depositTimeline.filter(event => event.completed).length;
    return Math.round((completedCount / this.depositTimeline.length) * 100);
  }

  getCompletedTimelineCount(): number {
    if (!this.depositTimeline) return 0;
    return this.depositTimeline.filter(event => event.completed).length;
  }

  getTotalTimelineCount(): number {
    return this.depositTimeline?.length || 0;
  }

  // Activity methods
  getRecentActivitiesCount(): number {
    return this.recentActivities.length;
  }

  hasRecentActivities(): boolean {
    return this.recentActivities.length > 0;
  }

  // Quick action methods
  executeQuickAction(actionId: string): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action && action.action) {
      action.action();
    }
  }

  // Property details methods
  getPropertySummary(): string {
    return `${this.propertyAddress} • Landlord: ${this.landlordName}`;
  }

  // Error handling
  handleError(error: any, context: string): void {
    console.error(`Error in dashboard overview - ${context}:`, error);
  }

  // Accessibility methods
  getAriaLabel(sectionId: string): string {
    const collapsed = this.isSectionCollapsed(sectionId);
    return `${collapsed ? 'Expand' : 'Collapse'} ${sectionId} section`;
  }

  // Animation and UI helpers
  getSectionClasses(sectionId: string): string {
    let classes = 'card collapsible-card';
    
    if (this.isSectionCollapsed(sectionId)) {
      classes += ' collapsed';
    }
    
    if (this.isAnimating(sectionId)) {
      classes += ' animating';
    }
    
    return classes;
  }

  // Data refresh methods
  refreshData(): void {
    this.loadDashboardData();
    console.log('Dashboard overview data refreshed');
  }

  // Component cleanup
  onDestroy(): void {
    // Cleanup any subscriptions or timers if needed
  }
}