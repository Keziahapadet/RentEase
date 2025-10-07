import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';
import { User, UserRole } from '../../../../services/auth-interfaces';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    RouterOutlet,
  ],
  templateUrl: './landlord-dashboard.html',
  styleUrls: ['./landlord-dashboard.scss']
})
export class LandlordDashboardComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  currentSection = 'dashboard';
  
  expandedMenus = {
    financials: false,
    properties: false,
    settings: false
  };

  currentUser: User | null = null;
  userDisplayName: string = 'User';
  userRole: string = 'Landlord';
  profileImage: string | null = null;

  totalProperties = 12;
  activeTenants = 45;
  monthlyRevenue = 'KSh 2.4M';
  vacantUnits = 3;

  recentActivities = [
    {
      icon: 'credit_card',
      color: '#10b981',
      text: 'Rent payment received from John Doe - Apartment 3B',
      time: '2 hours ago'
    },
    {
      icon: 'visibility',
      color: '#3b82f6',
      text: 'New vacancy posted for Apartment 2A',
      time: '4 hours ago'
    },
    {
      icon: 'handyman',
      color: '#ef4444',
      text: 'Maintenance request submitted - Plumbing issue Unit 1C',
      time: '6 hours ago'
    },
    {
      icon: 'description',
      color: '#8b5cf6',
      text: 'New lease agreement signed - Sarah Johnson',
      time: '1 day ago'
    }
  ];

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

  private profileUpdateListener: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentSectionFromRoute(event.urlAfterRedirects);
      // Refresh profile image on navigation
      this.loadProfileImage();
    });

    this.updateCurrentSectionFromRoute(this.router.url);
    
    // Listen for profile update events
    this.setupProfileUpdateListener();
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (this.profileUpdateListener) {
      window.removeEventListener('profileImageUpdated', this.profileUpdateListener);
    }
  }

  private setupProfileUpdateListener(): void {
    this.profileUpdateListener = () => {
      this.loadProfileImage();
    };
    
    // Listen for custom events from profile edit component
    window.addEventListener('profileImageUpdated', this.profileUpdateListener);
    
    // Also listen for storage events (for cross-tab updates)
    window.addEventListener('storage', (event) => {
      if (event.key === 'profileImage' || event.key === 'profileUpdated') {
        this.loadProfileImage();
      }
    });
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.userDisplayName = this.currentUser.fullName || 
                           this.currentUser.email?.split('@')[0] || 
                           'User';
      
      this.userRole = this.formatUserRole(this.currentUser.role);
      this.loadProfileImage();
    } else {
      this.userDisplayName = 'User';
      this.userRole = 'Landlord';
      this.profileImage = this.generateInitialAvatar('User');
    }
  }

  private loadProfileImage(): void {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      // Add cache buster to prevent browser caching
      this.profileImage = this.addCacheBuster(savedImage);
    } else if (this.currentUser?.avatar) {
      this.profileImage = this.addCacheBuster(this.currentUser.avatar);
    } else {
      this.profileImage = this.generateInitialAvatar(this.userDisplayName);
    }
  }

  private addCacheBuster(imageUrl: string): string {
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}t=${Date.now()}`;
  }

  private generateInitialAvatar(name: string): string {
    const names = name.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
    
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}" rx="50"/>
        <text x="50" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="600">${initials}</text>
      </svg>
    `)}`;
  }

  private formatUserRole(role: string | UserRole): string {
    const roleMap: { [key: string]: string } = {
      'LANDLORD': 'Landlord',
      'TENANT': 'Tenant',
      'CARETAKER': 'Caretaker',
      'BUSINESS': 'Business Owner',
      'ADMIN': 'Administrator'
    };
    
    return roleMap[role.toString()] || role.toString();
  }

  private updateCurrentSectionFromRoute(url: string): void {
    if (url === '/landlord-dashboard' || url === '/landlord-dashboard/') {
      this.currentSection = 'dashboard';
    } else if (url.includes('/property/create')) {
      this.currentSection = 'properties';
      this.expandedMenus.properties = true;
    } else if (url.includes('/property/units')) {
      this.currentSection = 'units';
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
    } else if (url.includes('/settings/general')) {
      this.currentSection = 'general';
      this.expandedMenus.settings = true;
    } else if (url.includes('/settings/account')) {
      this.currentSection = 'account';
      this.expandedMenus.settings = true;
    } else if (url.includes('/settings/alerts')) {
      this.currentSection = 'alerts';
      this.expandedMenus.settings = true;
    } else if (url.includes('/settings/security')) {
      this.currentSection = 'security';
      this.expandedMenus.settings = true;
    } else if (url.includes('/profile/view')) {
      this.currentSection = 'profile';
    } else if (url.includes('/profile/edit')) {
      this.currentSection = 'profile';
    } else {
      const urlParts = url.split('/');
      this.currentSection = urlParts[urlParts.length - 1] || 'dashboard';
    }
  }

  isNavActive(section: string): boolean {
    return this.currentSection === section;
  }

  isSubItemActive(subSection: string): boolean {
    return this.currentSection === subSection;
  }

  isParentActive(menuName: 'financials' | 'properties' | 'settings'): boolean {
    const financialSections = ['financials', 'invoices', 'payments', 'expenses'];
    const propertySections = ['properties', 'units', 'utilities', 'maintenance', 'property-grouping'];
    const settingsSections = ['general', 'account', 'alerts', 'security'];
    
    switch(menuName) {
      case 'financials':
        return financialSections.includes(this.currentSection);
      case 'properties':
        return propertySections.includes(this.currentSection) || this.router.url.includes('/property');
      case 'settings':
        return settingsSections.includes(this.currentSection);
      default:
        return false;
    }
  }

  viewProfile(): void {
    this.router.navigate(['/landlord-dashboard/profile/view']);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleMenu(menuName: keyof typeof this.expandedMenus): void {
    this.expandedMenus[menuName] = !this.expandedMenus[menuName];
  }

  editProfile(): void {
    this.isProfileMenuOpen = false;
    this.router.navigate(['/landlord-dashboard/profile/edit']);
  }

  navigateToSection(section: string): void {
    this.currentSection = section;
    this.isMobileMenuOpen = false;
    this.isProfileMenuOpen = false;

    switch (section) {
      case 'dashboard':
        this.router.navigate(['/landlord-dashboard']);
        break;
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
      case 'properties':
        this.router.navigate(['/landlord-dashboard/property']);
        this.expandedMenus.properties = true;
        break;
      case 'tenants':
        this.router.navigate(['/landlord-dashboard/tenants']);
        break;
      case 'messages':
        this.router.navigate(['/landlord-dashboard/messages']);
        break;
      case 'documents':
        this.router.navigate(['/landlord-dashboard/documents']);
        break;
      case 'marketplace':
        this.router.navigate(['/landlord-dashboard/marketplace']);
        break;
      case 'reviews':
        this.router.navigate(['/landlord-dashboard/reviews']);
        break;
      case 'reports':
        this.router.navigate(['/landlord-dashboard/reports']);
        break;
      case 'profile':
        this.router.navigate(['/landlord-dashboard/profile/view']);
        break;
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
    }
  }

  navigateToTenants(): void {
    this.navigateToSection('tenants');
  }

  addNewProperty(): void {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  viewNotifications(): void {
    this.navigateToSection('notifications');
  }

  isPlaceholderSection(): boolean {
    const routedSections = [
      'dashboard', 
      'financials', 
      'invoices', 
      'payments', 
      'expenses', 
      'properties', 
      'profile',
      'general',
      'account',
      'alerts',
      'security'
    ];
    
    return !routedSections.includes(this.currentSection) && 
           !this.router.url.includes('/property') &&
           !this.router.url.includes('/settings') &&
           !this.router.url.includes('/profile');
  }

  getSectionTitle(section: string): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'financials': 'Financials',
      'invoices': 'Invoices',
      'payments': 'Payments',
      'expenses': 'Expenses',
      'tenants': 'Tenants',
      'properties': 'Properties',
      'profile': 'Profile',
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('profileImage');
    this.router.navigate(['/login']);
  }
}