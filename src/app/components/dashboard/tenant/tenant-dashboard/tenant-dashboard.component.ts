import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepositComponent } from '../deposit/deposit.component';
import { PaymentsComponent } from '../payments/payments.component';
import { MaintenanceComponent } from '../maintenance/maintenance.component';
import { DocumentsComponent } from '../documents/documents.component';
import { MessagesComponent } from '../messages/messages.component';
import { MarketplaceComponent } from '../marketplace/marketplace.component';
import { ReviewComponent } from '../review/review.component';
import { SettingsComponent } from '../settings/settings.component';

interface TimelineEvent {
  title: string;
  date: string;
  description?: string;
  completed: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  time: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  dateSubmitted: string;
}

interface Conversation {
  id: string;
  name: string;
  avatarText: string;
  lastMessage: string;
  time: string;
}

interface Message {
  recipient: string;
  subject: string;
  content: string;
}

interface MarketplaceItem {
  title: string;
  description: string;
  price: number;
  location: string;
  seller: string;
}

interface Review {
  reviewer: string;
  date: string;
  rating: number;
  content: string;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [
    MatIconModule, 
    CommonModule, 
    FormsModule,
    DepositComponent, 
    PaymentsComponent,
    MaintenanceComponent,
    DocumentsComponent,
    MessagesComponent,
    MarketplaceComponent,
    ReviewComponent,
    SettingsComponent
  ],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent {
  // Sidebar & navigation
  isMobileMenuOpen = false;
  activeSection: string = 'dashboard';

  navigationItems = [
    { id: 'deposit', text: 'Deposit', icon: 'account_balance' },
    { id: 'payments', text: 'Payments', icon: 'payment' },
    { id: 'maintenance', text: 'Maintenance', icon: 'build' },
    { id: 'documents', text: 'Documents', icon: 'description' },
    { id: 'messages', text: 'Messages', icon: 'chat' },
    { id: 'marketplace', text: 'Marketplace', icon: 'store' },
    { id: 'reviews', text: 'Reviews', icon: 'star' },
    { id: 'settings', text: 'Settings', icon: 'settings' },
  ];

  // User Info
  userName = 'John Doe';
  userInitials = 'JD';
  userProfilePictureUrl = 'https://via.placeholder.com/40';
  propertyAddress = '123 Nairobi Street';
  landlordName = 'Mr. Smith';
  caretakerName = 'David Kamau';

  // Deposit
  depositAmount = 100000;
  depositTimeline: TimelineEvent[] = [
    { title: 'Deposit Paid', date: '01 Jan 2025', completed: true, description: 'Security deposit payment received' },
    { title: 'Verification', date: '05 Jan 2025', completed: true, description: 'Payment verification completed' },
    { title: 'Protection Activated', date: '10 Jan 2025', completed: true, description: 'Government deposit protection enabled' },
    { title: 'Documentation Complete', date: '15 Jan 2025', completed: false, description: 'All required documents processed' }
  ];

  // Rental
  rentAmount = 50000;
  nextRentDueDate = '01 March 2025';
  paymentStatus = { status: 'Paid', daysLeft: 15, className: 'status-success' };

  // Quick Actions
  quickActions: QuickAction[] = [
    { id: 'payRent', title: 'Pay Rent', description: 'Send your monthly rent', icon: 'payment', color: '#10b981' },
    { id: 'requestRepair', title: 'Request Repair', description: 'Submit a maintenance request', icon: 'build', color: '#f59e0b' },
    { id: 'contactLandlord', title: 'Contact Landlord', description: 'Message your landlord', icon: 'message', color: '#3b82f6' },
    { id: 'uploadDoc', title: 'View Documents', description: 'Access rental documents', icon: 'folder', color: '#8b5cf6' },
  ];

  // Activities
  recentActivities: Activity[] = [
    { id: 1, type: 'payment', title: 'February rent payment received', description: 'Payment confirmed via M-Pesa', icon: 'check', time: '2 days ago' },
    { id: 2, type: 'maintenance', title: 'Maintenance request submitted', description: 'Kitchen faucet repair request', icon: 'build', time: '5 days ago' },
    { id: 3, type: 'document', title: 'Message from landlord', description: 'Property inspection scheduled', icon: 'mail', time: '1 week ago' },
  ];

  // Notifications
  unreadNotifications = 3;

  // Collapsible Sections
  collapsedSections: { [key: string]: boolean } = {};
  animatingSections: { [key: string]: boolean } = {};

  // Maintenance
  newMaintenanceRequest = {
    title: '',
    category: '',
    priority: 'medium',
    description: ''
  };

  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      title: 'Kitchen faucet repair',
      category: 'Plumbing',
      priority: 'medium',
      description: 'The kitchen faucet is leaking and needs repair',
      status: 'in-progress',
      dateSubmitted: 'Feb 8, 2024'
    },
    {
      id: '2',
      title: 'Bedroom window lock',
      category: 'General Repairs',
      priority: 'low',
      description: 'Window lock is loose and needs tightening',
      status: 'completed',
      dateSubmitted: 'Jan 25, 2024'
    }
  ];

  // Messages
  conversations: Conversation[] = [
    { id: '1', name: 'Sarah Johnson', avatarText: 'SJ', lastMessage: 'Thank you for the payment confirmation', time: '2 hours ago' },
    { id: '2', name: 'David Kamau', avatarText: 'DK', lastMessage: 'Maintenance scheduled for tomorrow', time: '1 day ago' },
    { id: '3', name: 'Property Management', avatarText: 'PM', lastMessage: 'Monthly newsletter attached', time: '3 days ago' }
  ];

  activeConversationId: string = '';

  newMessage: Message = {
    recipient: '',
    subject: '',
    content: ''
  };

  // Marketplace
  activeMarketplaceTab: string = 'items';

  marketplaceItems = {
    items: [
      { title: 'Sofa Set', description: 'Comfortable 3-seater sofa in good condition', price: 25000, location: 'Westlands', seller: 'Jane Smith' },
      { title: 'Dining Table', description: '6-seater wooden dining table', price: 15000, location: 'Kilimani', seller: 'Mike Johnson' }
    ],
    services: [
      { title: 'House Cleaning', description: 'Professional cleaning services', price: 2000, location: 'Nairobi', seller: 'Clean Co.' },
      { title: 'Plumbing Services', description: 'Licensed plumber available', price: 3000, location: 'CBD', seller: 'Fix It Pro' }
    ],
    housing: [
      { title: 'Studio Apartment', description: 'Modern studio in secure building', price: 35000, location: 'Karen', seller: 'Property Plus' }
    ]
  };

  // Reviews
  averageRating: number = 4.2;
  recentReviews: Review[] = [
    { reviewer: 'Alice Johnson', date: 'Feb 10, 2024', rating: 5, content: 'Excellent property management and quick response to issues.' },
    { reviewer: 'Bob Smith', date: 'Jan 28, 2024', rating: 4, content: 'Great location and well-maintained facilities.' },
    { reviewer: 'Carol Davis', date: 'Jan 15, 2024', rating: 4, content: 'Good value for money, friendly landlord.' }
  ];

  // Collapsible Section Methods
  toggleSection(section: string) {
    this.animatingSections[section] = true;
    this.collapsedSections[section] = !this.collapsedSections[section];
    setTimeout(() => (this.animatingSections[section] = false), 300);
  }

  isSectionCollapsed(section: string): boolean {
    return this.collapsedSections[section] || false;
  }

  isAnimating(section: string): boolean {
    return this.animatingSections[section] || false;
  }

  expandAllSections() {
    Object.keys(this.collapsedSections).forEach(key => this.collapsedSections[key] = false);
  }

  collapseAllSections() {
    const sectionsToCollapse = ['deposit', 'rental', 'quickActions', 'activity'];
    sectionsToCollapse.forEach(section => this.collapsedSections[section] = true);
  }

  getCollapsedCount(): number {
    return Object.values(this.collapsedSections).filter(c => c).length;
  }

  // Deposit Helpers
  getDepositStatusText(): string {
    const completed = this.depositTimeline.filter(e => e.completed).length;
    return completed === this.depositTimeline.length ? 'Completed' : 'Protected';
  }

  getCompletedTimelineCount(): number {
    return this.depositTimeline.filter(e => e.completed).length;
  }

  getTotalTimelineCount(): number {
    return this.depositTimeline.length;
  }

  getTimelineCompletionPercentage(): number {
    return Math.round((this.getCompletedTimelineCount() / this.getTotalTimelineCount()) * 100);
  }

  // Activities
  hasRecentActivities(): boolean {
    return this.recentActivities.length > 0;
  }

  getRecentActivitiesCount(): number {
    return this.recentActivities.length;
  }

  trackByActivityId(index: number, activity: Activity) {
    return activity.id;
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'payment': return 'activity-success';
      case 'maintenance': return 'activity-info';
      case 'document': return 'activity-info';
      default: return 'activity-info';
    }
  }

  // Actions
  viewDepositDetails() { 
    this.setActiveSection('deposit');
  }

  viewPaymentHistory() { 
    this.setActiveSection('payments');
  }

  executeQuickAction(actionId: string) { 
    switch (actionId) {
      case 'payRent':
        this.setActiveSection('payments');
        break;
      case 'requestRepair':
        this.setActiveSection('maintenance');
        break;
      case 'contactLandlord':
        this.setActiveSection('messages');
        break;
      case 'uploadDoc':
        this.setActiveSection('documents');
        break;
    }
  }

  refreshData() { 
    console.log('Refreshing data...');
    // Simulate refresh
  }

  // Maintenance Methods
  submitMaintenanceRequest(): void {
    if (!this.newMaintenanceRequest.title || !this.newMaintenanceRequest.description) {
      return;
    }

    const request: MaintenanceRequest = {
      id: Date.now().toString(),
      title: this.newMaintenanceRequest.title,
      category: this.newMaintenanceRequest.category,
      priority: this.newMaintenanceRequest.priority,
      description: this.newMaintenanceRequest.description,
      status: 'submitted',
      dateSubmitted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    this.maintenanceRequests.unshift(request);

    // Reset form
    this.newMaintenanceRequest = {
      title: '',
      category: '',
      priority: 'medium',
      description: ''
    };

    alert('Maintenance request submitted successfully!');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'status-success',
      'in-progress': 'status-warning',
      'submitted': 'status-info',
      'cancelled': 'status-danger'
    };
    return statusMap[status] || 'status-secondary';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'urgent': 'priority-urgent',
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityMap[priority] || 'priority-medium';
  }

  // Message Methods
  setActiveConversation(conversationId: string): void {
    this.activeConversationId = conversationId;
  }

  sendMessage(): void {
    if (!this.newMessage.recipient || !this.newMessage.content) {
      return;
    }

    console.log('Sending message:', this.newMessage);

    // Reset form
    this.newMessage = {
      recipient: '',
      subject: '',
      content: ''
    };

    alert('Message sent successfully!');
  }

  // Marketplace Methods
  setActiveMarketplaceTab(tab: string): void {
    this.activeMarketplaceTab = tab;
  }

  getMarketplaceItems(): MarketplaceItem[] {
    const items = this.marketplaceItems as any;
    return items[this.activeMarketplaceTab] || [];
  }

  // Helpers
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-KE').format(num);
  }

  formatCurrency(num: number): string {
    return 'KSH ' + this.formatNumber(num);
  }

  // Sidebar controls
  toggleMobileMenu() { 
    this.isMobileMenuOpen = !this.isMobileMenuOpen; 
  }

  closeMobileMenu() { 
    this.isMobileMenuOpen = false; 
  }

  setActiveSection(section: string) { 
    this.activeSection = section; 
    this.closeMobileMenu(); 
  }

  // Notifications
  toggleNotifications() { 
    console.log('Toggle notifications panel');
  }

  // Logout
  logout() { 
    if (confirm('Are you sure you want to logout?')) {
      alert('Logging out...');
      // Add actual logout logic here
    }
  }

  // ARIA
  getAriaLabel(section: string): string {
    return this.isSectionCollapsed(section) ? `Expand ${section}` : `Collapse ${section}`;
  }
}