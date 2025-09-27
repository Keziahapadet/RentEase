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
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit, OnChanges {

  @Input() depositAmount!: number;
  @Input() rentAmount!: number;
  @Input() propertyAddress!: string;
  @Input() landlordName!: string;
  @Input() depositTimeline!: TimelineEvent[];
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  @Output() sectionToggle = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<string>();
  @Output() paymentClick = new EventEmitter<void>();
  
 
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


  private loadDashboardData(): void {
  
    this.refreshActivities();
  }

  private refreshActivities(): void {

    this.recentActivities = this.recentActivities.map(activity => ({
      ...activity,
      time: this.formatRelativeTime(activity.time)
    }));
  }

  private updateTimelineProgress(): void {
   
    if (this.depositTimeline) {
      const completedCount = this.depositTimeline.filter(event => event.completed).length;
      console.log(`Timeline progress: ${completedCount}/${this.depositTimeline.length} completed`);
    }
  }


  
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
  return activity.id; 
  
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
    
    return timeString;
  }


  
  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections?.has(sectionId) || false;
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections?.has(sectionId) || false;
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
  }


  navigateToSection(section: string): void {
    console.log(`Navigating to section: ${section}`);
    this.actionClick.emit(section);
  }

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


  
  getRecentActivitiesCount(): number {
    return this.recentActivities.length;
  }

  hasRecentActivities(): boolean {
    return this.recentActivities.length > 0;
  }

 
  
  executeQuickAction(actionId: string): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action && action.action) {
      action.action();
    }
  }


  

  getPropertySummary(): string {
    return `${this.propertyAddress} • Landlord: ${this.landlordName}`;
  }


  
  handleError(error: any, context: string): void {
    console.error(`Error in dashboard overview - ${context}:`, error);
  }

  
  
  getAriaLabel(sectionId: string): string {
    const collapsed = this.isSectionCollapsed(sectionId);
    return `${collapsed ? 'Expand' : 'Collapse'} ${sectionId} section`;
  }


  
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

 
  refreshData(): void {
    this.loadDashboardData();
    console.log('Dashboard overview data refreshed');
  }


  onDestroy(): void {
  }
}