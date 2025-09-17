// landlord-dashboard.component.ts - OPTION 2: Hybrid Approach (Minimal Changes)
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

// Import the financials component
import { FinancialsComponent } from './financials/financials';
import { InvoicesComponent } from './financials/invoices/invoices';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterOutlet,
    FinancialsComponent,
    InvoicesComponent
  ],
  templateUrl: './landlord-dashboard.html',
  styleUrls: ['./landlord-dashboard.css']
})
export class LandlordDashboardComponent implements OnInit {
  isMobileMenuOpen = false;
  currentSection = 'dashboard';
  
  expandedMenus = {
    financials: false,
    properties: false,
    settings: false
  };

  // Dashboard stats
  totalProperties = 12;
  activeTenants = 45;
  monthlyRevenue = 'KSh 2.4M';
  vacantUnits = 3;

  // Recent activity data
  recentActivities = [
    {
      icon: 'credit_card',
      color: '#059669',
      text: 'Rent payment received from John Doe - Apartment 3B',
      time: '2 hours ago'
    },
    {
      icon: 'visibility',
      color: '#1d4ed8',
      text: 'New vacancy posted for Apartment 2A',
      time: '4 hours ago'
    },
    {
      icon: 'handyman',
      color: '#dc2626',
      text: 'Maintenance request submitted - Plumbing issue Unit 1C',
      time: '6 hours ago'
    },
    {
      icon: 'description',
      color: '#7c3aed',
      text: 'New lease agreement signed - Sarah Johnson',
      time: '1 day ago'
    }
  ];

  // Quick stats data
  quickStats = [
    {
      icon: 'shield',
      amount: 'KSh 340K',
      label: 'Protected Deposits'
    },
    {
      icon: 'visibility',
      amount: '3 Pending',
      label: 'Move-out Inspections'
    },
    {
      icon: 'bar_chart',
      amount: '95.5%',
      label: 'Occupancy Rate'
    },
    {
      icon: 'email',
      amount: '8 New',
      label: 'Tenant Messages'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Subscribe to router events to update current section based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentSectionFromRoute(event.urlAfterRedirects);
    });

    // Set initial section based on current route
    this.updateCurrentSectionFromRoute(this.router.url);
  }

  // UPDATED: Better route-to-section mapping
  private updateCurrentSectionFromRoute(url: string): void {
    if (url === '/landlord-dashboard' || url === '/landlord-dashboard/') {
      this.currentSection = 'dashboard';
    } else if (url.includes('/property/create')) {
      this.currentSection = 'properties';
      this.expandedMenus.properties = true;
    } else if (url.includes('/property')) {
      this.currentSection = 'properties';
      this.expandedMenus.properties = true;
    } else if (url.includes('/financials/invoices')) {
      this.currentSection = 'invoices';
      this.expandedMenus.financials = true;
    } else if (url.includes('/financials/payments')) {
      this.currentSection = 'payments';
      this.expandedMenus.financials = true;
    } else if (url.includes('/financials/expenses')) {
      this.currentSection = 'expenses';
      this.expandedMenus.financials = true;
    } else if (url.includes('/financials')) {
      this.currentSection = 'financials';
      this.expandedMenus.financials = true;
    } else if (url.includes('/settings/')) {
      // Extract specific settings section
      const settingsSection = url.split('/settings/')[1];
      this.currentSection = settingsSection;
      this.expandedMenus.settings = true;
    } else {
      // Extract section from URL
      const urlParts = url.split('/');
      this.currentSection = urlParts[urlParts.length - 1] || 'dashboard';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMenu(menuName: keyof typeof this.expandedMenus): void {
    this.expandedMenus[menuName] = !this.expandedMenus[menuName];
  }

  // UPDATED: Navigation to handle property routing correctly
  navigateToSection(section: string): void {
    // Close mobile menu if open
    this.isMobileMenuOpen = false;
    
    // Update current section
    this.currentSection = section;
    
    // Use Angular routing for specific sections
    switch (section) {
      case 'dashboard':
        this.router.navigate(['/landlord-dashboard']);
        break;
      
      // Financials routing
      case 'financials':
        this.router.navigate(['/landlord-dashboard/financials']);
        this.expandedMenus.financials = true;
        break;
      case 'invoices':
        this.router.navigate(['/landlord-dashboard/financials/invoices']);
        this.expandedMenus.financials = true;
        break;
      case 'payments':
        this.router.navigate(['/landlord-dashboard/financials/payments']);
        this.expandedMenus.financials = true;
        break;
      case 'expenses':
        this.router.navigate(['/landlord-dashboard/financials/expenses']);
        this.expandedMenus.financials = true;
        break;
      
      // UPDATED: Property routing (SINGULAR) - matches your folder structure
      case 'properties':
        this.router.navigate(['/landlord-dashboard/property']);
        this.expandedMenus.properties = true;
        break;
      
      // Settings routing
      case 'general':
        this.router.navigate(['/landlord-dashboard/settings/general']);
        this.expandedMenus.settings = true;
        break;
      case 'account':
        this.router.navigate(['/landlord-dashboard/settings/account']);
        this.expandedMenus.settings = true;
        break;
      case 'alerts':
        this.router.navigate(['/landlord-dashboard/settings/alerts']);
        this.expandedMenus.settings = true;
        break;
      case 'security':
        this.router.navigate(['/landlord-dashboard/settings/security']);
        this.expandedMenus.settings = true;
        break;
      
      // Other sections without routing yet - just update currentSection
      default:
        console.log('Navigated to section:', section);
        break;
    }
  }

  navigateToTenants(): void {
    this.navigateToSection('tenants');
  }

  // UPDATED: Fixed to use correct property routing
  addNewProperty(): void {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  viewNotifications(): void {
    this.navigateToSection('notifications');
  }

  // UPDATED: Helper method to determine if current section should show placeholder
  isPlaceholderSection(): boolean {
    const routedSections = ['dashboard', 'financials', 'invoices', 'payments', 'expenses', 'properties'];
    return !routedSections.includes(this.currentSection) && 
           !this.router.url.includes('/property'); // Don't show placeholder for property routes
  }

  // Helper method to get section titles
  getSectionTitle(section: string): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'financials': 'Financials',
      'invoices': 'Invoices',
      'payments': 'Payments',
      'expenses': 'Expenses',
      'tenants': 'Tenants',
      'properties': 'Properties',
      'units': 'Units',
      'utilities': 'Utilities',
      'maintenance': 'Maintenance',
      'property-grouping': 'Property Grouping',
      'messages': 'Communication',
      'documents': 'Documents',
      'marketplace': 'Marketplace',
      'reviews': 'Reviews & Ratings',
      'reports': 'Reports',
      'general': 'General Settings',
      'account': 'Account Information',
      'alerts': 'Alert Settings',
      'security': 'Security Settings'
    };
    
    return titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
  }

  logout(): void {
    // Implement logout logic
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}