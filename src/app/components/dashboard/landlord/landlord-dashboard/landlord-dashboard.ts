// landlord-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Import the financials component
import { FinancialsComponent } from './financials/financials';
import { InvoicesComponent } from './financials/invoices/invoices';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterOutlet, // Add RouterOutlet for nested routing
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
    // Check current route to set initial section
    const currentUrl = this.router.url;
    if (currentUrl.includes('/property/create')) {
      this.currentSection = 'properties';
      this.expandedMenus.properties = true;
    } else if (currentUrl.includes('/property')) {
      this.currentSection = 'properties';
      this.expandedMenus.properties = true;
    } else if (currentUrl.includes('/financials/invoices')) {
      this.currentSection = 'invoices';
      this.expandedMenus.financials = true;
    } else if (currentUrl.includes('/financials')) {
      this.currentSection = 'financials';
      this.expandedMenus.financials = true;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMenu(menuName: keyof typeof this.expandedMenus): void {
    this.expandedMenus[menuName] = !this.expandedMenus[menuName];
  }

  // Updated navigation to handle all routing including property (SINGULAR)
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
      
      // Property routing (SINGULAR) 
      case 'properties':
        this.router.navigate(['/landlord-dashboard/property']);
        this.expandedMenus.properties = true;
        break;
      case 'units':
        // Redirect to property since units component doesn't exist yet
        this.router.navigate(['/landlord-dashboard/property']);
        this.expandedMenus.properties = true;
        console.log('Units section redirected to Property - Units component not yet implemented');
        break;
      
      // Other sections without routing yet
      default:
        console.log('Navigated to section:', section);
        break;
    }
  }

  navigateToTenants(): void {
    this.navigateToSection('tenants');
  }

  // Updated to use correct property routing (SINGULAR)
  addNewProperty(): void {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  viewNotifications(): void {
    this.navigateToSection('notifications');
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