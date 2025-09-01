// tenant-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule]
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

  // Navigation items - Updated with SVG icons instead of emojis
  navigationItems: NavigationItem[] = [
    { 
      id: 'deposit', 
      text: 'Deposit', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>` 
    },
    { 
      id: 'payments', 
      text: 'Payments', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
            </svg>` 
    },
    { 
      id: 'maintenance', 
      text: 'Maintenance', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>` 
    },
    { 
      id: 'documents', 
      text: 'Documents', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>` 
    },
    { 
      id: 'marketplace', 
      text: 'Marketplace', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>` 
    },
    { 
      id: 'messages', 
      text: 'Messages', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>` 
    },
    { 
      id: 'reviews', 
      text: 'Reviews', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>` 
    },
    { 
      id: 'settings', 
      text: 'Settings', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>` 
    }
  ];

  // Sample data
  conversations: Conversation[] = [
    { id: 1, name: 'Sarah Kimani (Landlord)', lastMessage: 'Rent received, thank you!', time: '2m', avatarText: 'SK' },
    { id: 2, name: 'Peter Mwangi (Caretaker)', lastMessage: 'Water will be restored by 3pm', time: '1h', avatarText: 'PM' },
    { id: 3, name: 'Building Group', lastMessage: 'Monthly meeting this Friday', time: '2h', avatarText: 'BG' }
  ];

  // Updated documents array with SVG icons instead of emojis
  documents: DocumentItem[] = [
    { 
      id: 1, 
      name: 'Lease Agreement', 
      date: 'Jan 15, 2024', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>`, 
      size: '2.1 MB', 
      category: 'Legal', 
      downloadUrl: '#' 
    },
    { 
      id: 2, 
      name: 'Rent Receipt - Feb', 
      date: 'Feb 5, 2024', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="8" y1="9" x2="8" y2="9"></line>
            </svg>`, 
      size: '156 KB', 
      category: 'Payments', 
      downloadUrl: '#' 
    },
    { 
      id: 3, 
      name: 'Property Inspection Report', 
      date: 'Jan 30, 2024', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <circle cx="11" cy="14" r="2"></circle>
              <path d="M21 15c-2.5-2-5.5-2-8 0"></path>
            </svg>`, 
      size: '890 KB', 
      category: 'Inspection', 
      downloadUrl: '#' 
    },
    { 
      id: 4, 
      name: 'Move-in Checklist', 
      date: 'Jan 15, 2024', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <polyline points="9,11 12,14 20,6"></polyline>
            </svg>`, 
      size: '245 KB', 
      category: 'Move-in', 
      downloadUrl: '#' 
    },
    { 
      id: 5, 
      name: 'Insurance Certificate', 
      date: 'Jan 1, 2024', 
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9,12 12,15 20,7"></polyline>
            </svg>`, 
      size: '1.2 MB', 
      category: 'Insurance', 
      downloadUrl: '#' 
    }
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

  // Updated marketplace items - removed emoji images, will be handled by template placeholders
  marketplaceItems: MarketplaceItems = {
    items: [
      { 
        id: 1, 
        title: 'Sofa Set', 
        price: 25000, 
        location: 'Kilimani', 
        seller: 'Unit 2B', 
        image: '', 
        description: 'Comfortable 3-seater sofa set in excellent condition' 
      },
      { 
        id: 2, 
        title: 'Dining Table', 
        price: 15000, 
        location: 'Westlands', 
        seller: 'Unit 4A', 
        image: '', 
        description: '6-seater wooden dining table with chairs' 
      }
    ],
    services: [
      { 
        id: 3, 
        title: 'House Cleaning', 
        price: 2500, 
        location: 'Kilimani', 
        seller: 'Mary K.', 
        image: '', 
        description: 'Professional house cleaning services' 
      },
      { 
        id: 4, 
        title: 'Plumbing Services', 
        price: 3000, 
        location: 'Parklands', 
        seller: 'John M.', 
        image: '', 
        description: 'Licensed plumber for all your plumbing needs' 
      }
    ],
    housing: [
      { 
        id: 5, 
        title: '2BR Apartment', 
        price: 65000, 
        location: 'Kileleshwa', 
        seller: 'Property Manager', 
        image: '', 
        description: 'Spacious 2-bedroom apartment with modern amenities' 
      },
      { 
        id: 6, 
        title: '1BR Studio', 
        price: 35000, 
        location: 'Kilimani', 
        seller: 'Unit Owner', 
        image: '', 
        description: 'Modern studio apartment, fully furnished' 
      }
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

  // Updated getStars method to return SVG instead of emoji
  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="display: inline-block; width: 16px; height: 16px; margin-right: 2px;">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>`;
    
    return starSvg.repeat(fullStars);
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