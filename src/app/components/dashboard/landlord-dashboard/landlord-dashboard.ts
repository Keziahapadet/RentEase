import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  templateUrl: './landlord-dashboard.html',
  styleUrls: ['./landlord-dashboard.css']
})
export class LandlordDashboardComponent {
  expandedMenus = {
    financials: true,
    properties: true,
    communication: false,
    settings: false
  };
  
  isMobileMenuOpen = false;

  stats = [
    {
      icon: 'building',
      value: '12',
      label: 'Total Properties',
      color: '#1d4ed8'
    },
    {
      icon: 'home',
      value: '48',
      label: 'Total Units',
      color: '#059669'
    },
    {
      icon: 'users',
      value: '45',
      label: 'Active Tenants',
      color: '#dc2626'
    },
    {
      icon: 'dollar',
      value: 'KSh 2.4M',
      label: 'Monthly Revenue',
      color: '#7c3aed'
    }
  ];

  recentActivities = [
    {
      icon: 'credit-card',
      text: 'Rent payment received from John Doe',
      time: '2 hours ago',
      color: '#059669'
    },
    {
      icon: 'eye',
      text: 'New vacancy posted for Apartment 3B',
      time: '4 hours ago',
      color: '#1d4ed8'
    },
    {
      icon: 'wrench',
      text: 'Maintenance request submitted - Unit 2A',
      time: '6 hours ago',
      color: '#dc2626'
    }
  ];

  depositStatus = [
    {
      icon: 'shield',
      amount: 'KSh 340,000',
      label: 'Protected Deposits'
    },
    {
      icon: 'eye',
      amount: '3 Pending',
      label: 'Move-out Inspections'
    }
  ];

  constructor(private router: Router) {}

  toggleMenu(menu: string) {
    this.expandedMenus = {
      ...this.expandedMenus,
      [menu]: !this.expandedMenus[menu as keyof typeof this.expandedMenus]
    };
  }

  // Generic navigation method for all sections
  navigateToSection(section: string) {
    this.router.navigate([`/landlord/${section}`]);
  }

  // Specific navigation methods
  navigateToFinancials() {
    this.router.navigate(['/landlord/financials']);
  }

  navigateToProperties() {
    this.router.navigate(['/landlord/properties']);
  }

  navigateToTenants() {
    this.router.navigate(['/landlord/tenants']);
  }

  navigateToDocuments() {
    this.router.navigate(['/landlord/documents']);
  }

  navigateToCommunication() {
    this.router.navigate(['/landlord/communication']);
  }

  navigateToMarketplace() {
    this.router.navigate(['/landlord/marketplace']);
  }

  navigateToReviews() {
    this.router.navigate(['/landlord/reviews']);
  }

  navigateToReports() {
    this.router.navigate(['/landlord/reports']);
  }

  navigateToSettings() {
    this.router.navigate(['/landlord/settings']);
  }

  // Header action methods
  addNewProperty() {
    this.router.navigate(['/landlord/properties/add']);
  }

  viewNotifications() {
    this.router.navigate(['/landlord/notifications']);
  }

  // Mobile menu functionality
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Utility methods
  logout() {
    // Add logout logic here
    console.log('Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}