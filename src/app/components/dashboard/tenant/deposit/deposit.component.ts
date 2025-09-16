import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  description?: string;
  amount?: number;
  reference?: string;
  type?: 'payment' | 'protection' | 'verification' | 'inspection';
}

export interface DepositSummary {
  totalAmount: number;
  protectionScheme: string;
  protectionSchemeDetails: string;
  datePaid: string;
  refundableAmount: number;
  nonRefundableAmount: number;
  interestRate?: number;
  expectedReturnDate?: string;
  protectionCertificateUrl?: string;
  disputeProcessUrl?: string;
}

export interface DepositBreakdown {
  description: string;
  amount: number;
  type: 'refundable' | 'non-refundable' | 'fee';
  percentage?: number;
}

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit, OnChanges {
  // Input properties
  @Input() depositAmount!: number;
  @Input() depositTimeline!: TimelineEvent[];
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  // Output events
  @Output() backClick = new EventEmitter<void>();
  @Output() sectionToggle = new EventEmitter<string>();
  
  // Component state
  selectedTab: 'summary' | 'timeline' | 'breakdown' | 'protection' = 'summary';
  isLoading: boolean = false;
  
  // Deposit details
  depositSummary: DepositSummary = {
    totalAmount: 50000,
    protectionScheme: 'Government Deposit Protection',
    protectionSchemeDetails: 'Your deposit is protected under the Kenya Residential Tenancy Act 2023',
    datePaid: 'January 15, 2024',
    refundableAmount: 45000,
    nonRefundableAmount: 5000,
    interestRate: 2.5,
    expectedReturnDate: 'Within 30 days of lease termination',
    protectionCertificateUrl: '/assets/documents/deposit-certificate.pdf',
    disputeProcessUrl: '/assets/documents/dispute-process.pdf'
  };
  
  // Deposit breakdown
  depositBreakdown: DepositBreakdown[] = [
    {
      description: 'Security Deposit',
      amount: 40000,
      type: 'refundable',
      percentage: 80
    },
    {
      description: 'Key Deposit',
      amount: 5000,
      type: 'refundable',
      percentage: 10
    },
    {
      description: 'Processing Fee',
      amount: 3000,
      type: 'non-refundable',
      percentage: 6
    },
    {
      description: 'Protection Insurance',
      amount: 2000,
      type: 'fee',
      percentage: 4
    }
  ];
  
  // Protection features
  protectionFeatures = [
    {
      icon: 'shield',
      title: 'Government Protected',
      description: 'Your deposit is secured under government protection scheme'
    },
    {
      icon: 'gavel',
      title: 'Dispute Resolution',
      description: 'Free mediation service for deposit-related disputes'
    },
    {
      icon: 'account_balance',
      title: 'Separate Account',
      description: 'Held in a separate escrow account, not mixed with landlord funds'
    },
    {
      icon: 'trending_up',
      title: 'Interest Bearing',
      description: 'Earns 2.5% annual interest while deposited'
    },
    {
      icon: 'schedule',
      title: 'Quick Refund',
      description: 'Automatic refund within 30 days of lease termination'
    },
    {
      icon: 'receipt',
      title: 'Full Documentation',
      description: 'Complete paper trail and digital receipts for all transactions'
    }
  ];

  ngOnInit(): void {
    this.initializeComponent();
    this.syncDepositAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['depositAmount'] && this.depositAmount) {
      this.syncDepositAmount();
    }
    if (changes['depositTimeline'] && this.depositTimeline) {
      this.processTimelineData();
    }
  }

  // Initialization
  private initializeComponent(): void {
    this.validateInputs();
    this.loadDepositDetails();
  }

  private validateInputs(): void {
    if (!this.depositAmount || this.depositAmount <= 0) {
      console.warn('Invalid deposit amount provided to deposit component');
    }
    if (!this.depositTimeline || this.depositTimeline.length === 0) {
      console.warn('No deposit timeline provided to deposit component');
    }
  }

  private syncDepositAmount(): void {
    if (this.depositAmount && this.depositAmount !== this.depositSummary.totalAmount) {
      this.depositSummary.totalAmount = this.depositAmount;
      this.recalculateBreakdown();
    }
  }

  private loadDepositDetails(): void {
    // In a real application, this would fetch from a service
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.processTimelineData();
      this.isLoading = false;
    }, 500);
  }

  private processTimelineData(): void {
    if (!this.depositTimeline) return;
    
    // Process timeline events to extract additional information
    this.depositTimeline.forEach(event => {
      if (event.type === 'payment' && event.amount) {
        // Update payment information if needed
      }
    });
  }

  // Navigation methods
  goBack(): void {
    this.backClick.emit();
  }

  setActiveTab(tab: 'summary' | 'timeline' | 'breakdown' | 'protection'): void {
    this.selectedTab = tab;
  }

  isActiveTab(tab: string): boolean {
    return this.selectedTab === tab;
  }

  // Section management
  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections?.has(sectionId) || false;
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections?.has(sectionId) || false;
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
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

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Timeline methods
  getTimelineCompletionPercentage(): number {
    if (!this.depositTimeline || this.depositTimeline.length === 0) return 0;
    
    const completedCount = this.depositTimeline.filter(event => event.completed).length;
    return Math.round((completedCount / this.depositTimeline.length) * 100);
  }

  getCompletedEventsCount(): number {
    if (!this.depositTimeline) return 0;
    return this.depositTimeline.filter(event => event.completed).length;
  }

  getTotalEventsCount(): number {
    return this.depositTimeline?.length || 0;
  }

  getNextPendingEvent(): TimelineEvent | null {
    if (!this.depositTimeline) return null;
    return this.depositTimeline.find(event => !event.completed) || null;
  }

  // Breakdown methods
  private recalculateBreakdown(): void {
    const total = this.depositSummary.totalAmount;
    if (total <= 0) return;

    // Recalculate amounts based on percentages
    this.depositBreakdown = this.depositBreakdown.map(item => ({
      ...item,
      amount: Math.round((total * (item.percentage || 0)) / 100)
    }));

    // Update refundable/non-refundable amounts
    this.depositSummary.refundableAmount = this.depositBreakdown
      .filter(item => item.type === 'refundable')
      .reduce((sum, item) => sum + item.amount, 0);

    this.depositSummary.nonRefundableAmount = this.depositBreakdown
      .filter(item => item.type === 'non-refundable' || item.type === 'fee')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getRefundablePercentage(): number {
    if (this.depositSummary.totalAmount === 0) return 0;
    return (this.depositSummary.refundableAmount / this.depositSummary.totalAmount) * 100;
  }

  getNonRefundablePercentage(): number {
    if (this.depositSummary.totalAmount === 0) return 0;
    return (this.depositSummary.nonRefundableAmount / this.depositSummary.totalAmount) * 100;
  }

  // Protection methods
  downloadProtectionCertificate(): void {
    if (this.depositSummary.protectionCertificateUrl) {
      const link = document.createElement('a');
      link.href = this.depositSummary.protectionCertificateUrl;
      link.download = 'deposit-protection-certificate.pdf';
      link.click();
    }
  }

  downloadDisputeProcess(): void {
    if (this.depositSummary.disputeProcessUrl) {
      const link = document.createElement('a');
      link.href = this.depositSummary.disputeProcessUrl;
      link.download = 'deposit-dispute-process.pdf';
      link.click();
    }
  }

  openDisputePortal(): void {
    // In a real application, this would open the dispute portal
    window.open('https://deposit-protection-portal.gov.ke', '_blank');
  }

  // Interest calculation
  calculateProjectedInterest(): number {
    const principal = this.depositSummary.refundableAmount;
    const rate = this.depositSummary.interestRate || 0;
    const timeInYears = 1; // Assume 1 year lease
    
    return Math.round((principal * rate * timeInYears) / 100);
  }

  getProjectedRefundAmount(): number {
    return this.depositSummary.refundableAmount + this.calculateProjectedInterest();
  }

  // Status methods
  getDepositStatus(): { status: string; className: string; icon: string } {
    const completionPercentage = this.getTimelineCompletionPercentage();
    
    if (completionPercentage === 100) {
      return {
        status: 'Fully Protected',
        className: 'status-success',
        icon: 'verified'
      };
    } else if (completionPercentage >= 75) {
      return {
        status: 'Nearly Complete',
        className: 'status-warning',
        icon: 'pending'
      };
    } else if (completionPercentage >= 50) {
      return {
        status: 'In Progress',
        className: 'status-info',
        icon: 'schedule'
      };
    } else {
      return {
        status: 'Pending Setup',
        className: 'status-warning',
        icon: 'hourglass_empty'
      };
    }
  }

  // Event tracking
  trackByTimelineId(index: number, event: TimelineEvent): string {
    return `${event.title}-${event.date}`;
  }

  trackByBreakdownId(index: number, item: DepositBreakdown): string {
    return `${item.description}-${item.amount}`;
  }

  trackByFeatureId(index: number, feature: any): string {
    return feature.title;
  }

  // Error handling
  handleError(error: any, context: string): void {
    console.error(`Error in deposit component - ${context}:`, error);
    // In a real application, you might show a toast notification
  }

  // Accessibility
  getAriaLabel(sectionId: string): string {
    const collapsed = this.isSectionCollapsed(sectionId);
    return `${collapsed ? 'Expand' : 'Collapse'} ${sectionId} section`;
  }

  getTabAriaLabel(tab: string): string {
    return `Switch to ${tab} tab`;
  }

  // Component lifecycle
  ngOnDestroy(): void {
    // Cleanup any subscriptions or timers
  }
}