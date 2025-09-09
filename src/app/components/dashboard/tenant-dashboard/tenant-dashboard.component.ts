
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface PaymentRecord {
  id: number;
  date: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  reference: string;
}

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'in-progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  dateCompleted?: string;
  assignedTo?: string;
}

interface DocumentItem {
  id: number;
  name: string;
  date: string;
  icon: string;
  size: string;
  category: string;
  downloadUrl: string;
}

interface MarketplaceItem {
  id: number;
  title: string;
  price: number;
  location: string;
  seller: string;
  image: string;
  description: string;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatarText: string;
}

interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
}

interface Review {
  reviewer: string;
  rating: number;
  content: string;
  date: string;
}

interface NavigationItem {
  id: string;
  text: string;
  icon: string; 
}

type MarketplaceTab = 'items' | 'services' | 'housing';

interface MarketplaceItems {
  items: MarketplaceItem[];
  services: MarketplaceItem[];
  housing: MarketplaceItem[];
}

@Component({
  selector: 'app-tenant-dashboard',
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule]
})
export class TenantDashboardComponent implements OnInit {
  // UI State
  isMobileMenuOpen = false;
  activeSection = 'dashboard';
  activeConversationId = 1;
  activeMarketplaceTab: MarketplaceTab = 'items';
  
  // User Data
  userName = 'John Doe';
  userInitials = 'JD';
  userProfilePictureUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format';
  propertyAddress = 'Kilimani Apartments, Unit 4B';
  landlordName = 'Sarah Kimani';
  caretakerName = 'Peter Mwangi';
  rentAmount = 85000;
  rentDueDate = '5th';
  rentStatus: 'paid' | 'pending' = 'paid';
  depositAmount = 170000;
  depositStatus: 'protected' | 'pending' | 'released' = 'protected';
  averageRating = 4.8;
  unreadNotifications = 3;

  // Collapsible functionality
  collapsedSections = {
    deposit: false,
    rental: false,
    quickActions: false,
    activity: false,
    payments: false,
    maintenance: false,
    documents: false,
    messages: false,
    marketplace: false,
    reviews: false,
    settings: false
  };

  // Animation states for smooth transitions
  animatingElements = new Set<string>();

  // Navigation items - Fixed to use proper Material Icon names
  navigationItems: NavigationItem[] = [
    { id: 'deposit', text: 'Deposit', icon: 'account_balance_wallet' },
    { id: 'payments', text: 'Payments', icon: 'payment' },
    { id: 'maintenance', text: 'Maintenance', icon: 'build' },
    { id: 'documents', text: 'Documents', icon: 'folder' },
    { id: 'marketplace', text: 'Marketplace', icon: 'shopping_cart' },
    { id: 'messages', text: 'Messages', icon: 'message' },
    { id: 'reviews', text: 'Reviews', icon: 'star' },
    { id: 'settings', text: 'Settings', icon: 'settings' }
  ];

  // Sample data
  conversations: Conversation[] = [
    { id: 1, name: 'Sarah Kimani (Landlord)', lastMessage: 'Rent received, thank you!', time: '2m', avatarText: 'SK' },
    { id: 2, name: 'Peter Mwangi (Caretaker)', lastMessage: 'Water will be restored by 3pm', time: '1h', avatarText: 'PM' },
    { id: 3, name: 'Building Group', lastMessage: 'Monthly meeting this Friday', time: '2h', avatarText: 'BG' }
  ];

  // Fixed documents array with proper Material Icon names
  documents: DocumentItem[] = [
    { id: 1, name: 'Lease Agreement', date: 'Jan 15, 2024', icon: 'description', size: '2.1 MB', category: 'Legal', downloadUrl: '#' },
    { id: 2, name: 'Rent Receipt - Feb', date: 'Feb 5, 2024', icon: 'receipt', size: '156 KB', category: 'Payments', downloadUrl: '#' },
    { id: 3, name: 'Property Inspection Report', date: 'Jan 30, 2024', icon: 'fact_check', size: '890 KB', category: 'Inspection', downloadUrl: '#' },
    { id: 4, name: 'Move-in Checklist', date: 'Jan 15, 2024', icon: 'checklist', size: '245 KB', category: 'Move-in', downloadUrl: '#' },
    { id: 5, name: 'Insurance Certificate', date: 'Jan 1, 2024', icon: 'security', size: '1.2 MB', category: 'Insurance', downloadUrl: '#' }
  ];

  paymentHistory: PaymentRecord[] = [
    { id: 1, date: '2024-02-05', amount: 85000, type: 'Monthly Rent', status: 'paid', method: 'M-Pesa', reference: 'MP240205001' },
    { id: 2, date: '2024-01-05', amount: 85000, type: 'Monthly Rent', status: 'paid', method: 'Bank Transfer', reference: 'BT240105001' },
    { id: 3, date: '2024-01-15', amount: 170000, type: 'Security Deposit', status: 'paid', method: 'Bank Transfer', reference: 'BT240115001' },
    { id: 4, date: '2024-03-05', amount: 85000, type: 'Monthly Rent', status: 'pending', method: 'M-Pesa', reference: 'MP240305001' }
  ];

  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 1,
      title: 'Leaking Kitchen Faucet',
      description: 'The kitchen faucet has been leaking for the past few days. Water drips continuously.',
      category: 'Plumbing',
      priority: 'medium',
      status: 'in-progress',
      dateSubmitted: '2024-02-15',
      assignedTo: 'Peter Mwangi'
    },
    {
      id: 2,
      title: 'Broken Window Latch',
      description: 'Living room window latch is broken and window won\'t stay closed properly.',
      category: 'General Repairs',
      priority: 'low',
      status: 'submitted',
      dateSubmitted: '2024-02-20'
    },
    {
      id: 3,
      title: 'Air Conditioning Not Working',
      description: 'AC unit in bedroom stopped working. No cold air coming out.',
      category: 'HVAC',
      priority: 'high',
      status: 'completed',
      dateSubmitted: '2024-01-28',
      dateCompleted: '2024-02-02',
      assignedTo: 'HVAC Specialist'
    }
  ];

  marketplaceItems: MarketplaceItems = {
    items: [
      { id: 1, title: 'Sofa Set', price: 25000, location: 'Kilimani', seller: 'Unit 2B', image: '', description: 'Comfortable 3-seater sofa set in excellent condition' },
      { id: 2, title: 'Dining Table', price: 15000, location: 'Westlands', seller: 'Unit 4A', image: '', description: '6-seater wooden dining table with chairs' }
    ],
    services: [
      { id: 3, title: 'House Cleaning', price: 2500, location: 'Kilimani', seller: 'Mary K.', image: '', description: 'Professional house cleaning services' },
      { id: 4, title: 'Plumbing Services', price: 3000, location: 'Parklands', seller: 'John M.', image: '', description: 'Licensed plumber for all your plumbing needs' }
    ],
    housing: [
      { id: 5, title: '2BR Apartment', price: 65000, location: 'Kileleshwa', seller: 'Property Manager', image: '', description: 'Spacious 2-bedroom apartment with modern amenities' },
      { id: 6, title: '1BR Studio', price: 35000, location: 'Kilimani', seller: 'Unit Owner', image: '', description: 'Modern studio apartment, fully furnished' }
    ]
  };

  depositTimeline: TimelineEvent[] = [
    { title: 'Deposit Paid', date: 'Jan 15, 2024', completed: true },
    { title: 'Deposit Protected', date: 'Jan 16, 2024', completed: true },
    { title: 'Move-in Completed', date: 'Jan 20, 2024', completed: true }
  ];

  recentReviews: Review[] = [
    { reviewer: 'Anonymous Tenant', rating: 5, content: 'Great landlord, very responsive!', date: 'Feb 1, 2024' },
    { reviewer: 'Unit 3A', rating: 4, content: 'Well maintained property', date: 'Jan 28, 2024' }
  ];

  // New maintenance request form
  newMaintenanceRequest: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  } = {
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  };

  // Message composition
  newMessage: {
    recipient: string;
    subject: string;
    content: string;
  } = {
    recipient: '',
    subject: '',
    content: ''
  };

  ngOnInit(): void {
    // Initialize component
  }

  // Navigation methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.closeMobileMenu();
  }

  setActiveConversation(conversationId: number): void {
    this.activeConversationId = conversationId;
  }

  setActiveMarketplaceTab(tab: MarketplaceTab): void {
    this.activeMarketplaceTab = tab;
  }

  // Collapsible methods
  toggleSection(section: keyof typeof this.collapsedSections): void {
    this.collapsedSections[section] = !this.collapsedSections[section];
    
    // Add animation class temporarily
    this.animatingElements.add(section);
    
    // Remove animation class after transition
    setTimeout(() => {
      this.animatingElements.delete(section);
    }, 300);
  }

  isSectionCollapsed(section: keyof typeof this.collapsedSections): boolean {
    return this.collapsedSections[section];
  }

  isAnimating(section: string): boolean {
    return this.animatingElements.has(section);
  }

  // Expand/collapse all sections
  expandAllSections(): void {
    Object.keys(this.collapsedSections).forEach(key => {
      (this.collapsedSections as any)[key] = false;
    });
  }

  collapseAllSections(): void {
    Object.keys(this.collapsedSections).forEach(key => {
      (this.collapsedSections as any)[key] = true;
    });
  }

  // Get collapsed sections count
  getCollapsedCount(): number {
    return Object.values(this.collapsedSections).filter(collapsed => collapsed).length;
  }

  // Utility methods
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getDepositStatusText(): string {
    switch (this.depositStatus) {
      case 'protected': return 'Protected';
      case 'pending': return 'Pending';
      case 'released': return 'Released';
      default: return 'Unknown';
    }
  }

  getMarketplaceItems(): MarketplaceItem[] {
    return this.marketplaceItems[this.activeMarketplaceTab];
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-success';
      case 'pending': return 'status-warning';
      case 'overdue': return 'status-danger';
      case 'completed': return 'status-success';
      case 'in-progress': return 'status-info';
      case 'submitted': return 'status-warning';
      case 'cancelled': return 'status-secondary';
      default: return 'status-secondary';
    }
  }

  // Action methods
  downloadDocument(doc: DocumentItem): void {
    console.log('Downloading document:', doc.name);
    // Implementation for document download
  }

  submitMaintenanceRequest(): void {
    if (this.newMaintenanceRequest.title && this.newMaintenanceRequest.description) {
      const newRequest: MaintenanceRequest = {
        id: this.maintenanceRequests.length + 1,
        title: this.newMaintenanceRequest.title,
        description: this.newMaintenanceRequest.description,
        category: this.newMaintenanceRequest.category || 'General',
        priority: this.newMaintenanceRequest.priority,
        status: 'submitted',
        dateSubmitted: new Date().toISOString().split('T')[0]
      };
      
      this.maintenanceRequests.unshift(newRequest);
      
      // Reset form
      this.newMaintenanceRequest = {
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      };
      
      console.log('Maintenance request submitted:', newRequest);
    }
  }

  sendMessage(): void {
    if (this.newMessage.recipient && this.newMessage.content) {
      console.log('Sending message:', this.newMessage);
      
      // Reset form
      this.newMessage = {
        recipient: '',
        subject: '',
        content: ''
      };
    }
  }

  makePayment(): void {
    console.log('Redirecting to payment gateway');
    // Implementation for payment processing
  }

  toggleNotifications(): void {
    console.log('Toggle notifications');
  }

  logout(): void {
    console.log('Logging out');
    // Implementation for logout
  }
}