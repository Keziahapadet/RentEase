import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { PropertyService } from '../../../../../services/property.service';
import { AuthService } from '../../../../../services/auth.service';
import { Property, Unit } from '../../../../../services/dashboard-interface';
import { User } from '../../../../../services/auth-interfaces';
import { DashboardStats, StatCardConfig } from '../../../../../services/dashboard-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landlord-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './landlord-dashboard-home.component.html',
  styleUrls: ['./landlord-dashboard-home.component.scss']
})
export class LandlordDashboardHomeComponent implements OnInit, OnDestroy {
  dashboardStats: DashboardStats = {
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    maintenanceUnits: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    pendingRent: 0,
    totalTenants: 0
  };

  statCards: StatCardConfig[] = [];
  recentProperties: Property[] = [];
  recentUnits: Unit[] = [];
  allProperties: Property[] = [];
  loading = true;
  loadingProperties = true;
  errorMessage = '';
  private subscriptions = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const shouldRedirectToLogin = sessionStorage.getItem('redirectToLoginAfterReset');
    if (shouldRedirectToLogin) {
      sessionStorage.removeItem('redirectToLoginAfterReset');
      this.authService.logoutSync();
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData() {
    this.loading = true;
    this.errorMessage = '';
    this.loadAllProperties();
  }

  private loadAllProperties() {
    this.loadingProperties = true;

    const propertiesSub = this.propertyService.getProperties().subscribe({
      next: (response: any) => {
        let properties: Property[] = [];
        
        if (Array.isArray(response)) {
          properties = response;
        } else if (response?.data && Array.isArray(response.data)) {
          properties = response.data;
        } else if (response?.properties && Array.isArray(response.properties)) {
          properties = response.properties;
        } else if (response?.content && Array.isArray(response.content)) {
          properties = response.content;
        } else if (response?.success && Array.isArray(response.data)) {
          properties = response.data;
        } else {
          properties = [];
        }

        this.allProperties = properties;
        this.calculateDashboardStats(properties);
        this.loadRecentProperties(properties);
        this.loadRecentUnits(properties);
        this.initializeStatCards();
        this.loadingProperties = false;
        this.loading = false;
      },
      error: (error: any) => {
        this.loadingProperties = false;
        this.loading = false;
        this.errorMessage = error?.message || 'Failed to load dashboard data';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        
        if (error.status === 401) {
          setTimeout(() => {
            this.authService.logout().subscribe();
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });

    this.subscriptions.add(propertiesSub);
  }

  private calculateDashboardStats(properties: Property[]) {
    let totalProperties = 0;
    let totalUnits = 0;
    let occupiedUnits = 0;
    let vacantUnits = 0;
    let maintenanceUnits = 0;
    let monthlyRevenue = 0;
    let totalTenants = 0;

    properties.forEach(property => {
      totalProperties++;
      totalUnits += property.totalUnits || 0;
      
      if (property.units && Array.isArray(property.units)) {
        property.units.forEach(unit => {
          if (unit.status === 'occupied') {
            occupiedUnits++;
            monthlyRevenue += unit.rentAmount || 0;
            if (unit.tenant) {
              totalTenants++;
            }
          } else if (unit.status === 'vacant') {
            vacantUnits++;
          } else if (unit.status === 'maintenance') {
            maintenanceUnits++;
          }
        });
      }
    });

    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    this.dashboardStats = {
      totalProperties,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate,
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12,
      pendingRent: 0,
      totalTenants
    };
  }

  private initializeStatCards() {
    this.statCards = [
      {
        title: 'Total Properties',
        value: this.dashboardStats.totalProperties,
        icon: 'apartment',
        color: 'properties',
        route: ['/landlord-dashboard/property']
      },
      {
        title: 'Total Units',
        value: this.dashboardStats.totalUnits,
        icon: 'meeting_room',
        color: 'units',
        route: []
      },
      {
        title: 'Occupancy Rate',
        value: `${this.dashboardStats.occupancyRate}%`,
        icon: 'trending_up',
        color: 'occupancy',
        route: []
      },
      {
        title: 'Monthly Revenue',
        value: this.formatCompactCurrency(this.dashboardStats.monthlyRevenue),
        icon: 'attach_money',
        color: 'revenue',
        route: []
      },
      {
        title: 'Occupied Units',
        value: this.dashboardStats.occupiedUnits,
        icon: 'person',
        color: 'occupied',
        route: [],
        queryParams: { filter: 'occupied' }
      },
      {
        title: 'Vacant Units',
        value: this.dashboardStats.vacantUnits,
        icon: 'event_available',
        color: 'vacant',
        route: [],
        queryParams: { filter: 'vacant' }
      },
      {
        title: 'Total Tenants',
        value: this.dashboardStats.totalTenants,
        icon: 'groups',
        color: 'tenants',
        route: []
      },
      {
        title: 'Maintenance Units',
        value: this.dashboardStats.maintenanceUnits,
        icon: 'build',
        color: 'maintenance',
        route: [],
        queryParams: { filter: 'maintenance' }
      }
    ];
  }

  onStatCardClick(card: StatCardConfig) {
    if (card.queryParams) {
      this.router.navigate(card.route, { queryParams: card.queryParams });
    } else {
      this.router.navigate(card.route);
    }
  }

  private loadRecentProperties(properties: Property[]) {
    this.recentProperties = properties
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }

  private loadRecentUnits(properties: Property[]) {
    let allUnits: Unit[] = [];

    properties.forEach(property => {
      if (property.units && Array.isArray(property.units)) {
        allUnits = allUnits.concat(property.units.map(unit => ({
          ...unit,
          propertyName: property.name,
          propertyId: property.id
        })));
      }
    });

    this.recentUnits = allUnits
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }

  refreshDashboard() {
    this.loading = true;
    this.snackBar.open('Refreshing dashboard...', 'Close', { duration: 2000 });
    
    this.dashboardStats = {
      totalProperties: 0,
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      maintenanceUnits: 0,
      occupancyRate: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      pendingRent: 0,
      totalTenants: 0
    };
    this.recentProperties = [];
    this.recentUnits = [];
    this.allProperties = [];
    this.statCards = [];

    this.loadDashboardData();
  }

  navigateToProperties() {
    this.router.navigate(['/landlord-dashboard/property']);
  }

  navigateToPropertyCreate() {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  navigateToPropertyDetails(propertyId: string) {
    this.router.navigate(['/landlord-dashboard/property', propertyId]);
  }

  navigateToPropertyUnits(propertyId: string) {
    this.router.navigate(['/landlord-dashboard/property', propertyId, 'units']);
  }

  navigateToTenants() {
    this.router.navigate(['/landlord-dashboard/tenants']);
  }

  navigateToRentPayments() {
    this.router.navigate(['/landlord-dashboard/rent-payments']);
  }

  navigateToReports() {
    this.router.navigate(['/landlord-dashboard/reports']);
  }

  formatCurrency(amount: number | undefined | null): string {
    if (amount == null) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatCompactCurrency(amount: number | undefined | null): string {
    if (amount == null) return 'KES 0';
    if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
    return `KES ${amount.toLocaleString()}`;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'occupied': return 'status-occupied';
      case 'vacant': return 'status-vacant';
      case 'maintenance': return 'status-maintenance';
      case 'reserved': return 'status-reserved';
      default: return 'status-unknown';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'occupied': return 'person';
      case 'vacant': return 'event_available';
      case 'maintenance': return 'build';
      case 'reserved': return 'schedule';
      default: return 'help';
    }
  }

  getPropertyTypeDisplay(type: string | undefined): string {
    const typeMap: { [key: string]: string } = {
      'APARTMENT': 'Apartment',
      'HOUSE': 'House',
      'BUNGALOW': 'Bungalow',
      'COMMERCIAL': 'Commercial',
      'CONDO': 'Condominium',
      'TOWNHOUSE': 'Townhouse',
      'MIXED': 'Mixed Use'
    };
    return typeMap[type ?? ''] ?? type ?? 'Property';
  }

  getUnitTypeDisplay(type: string | undefined): string {
    const typeMap: { [key: string]: string } = {
      'SINGLE': 'Single Room',
      'BEDSITTER': 'Bedsitter',
      '1BR': '1 Bedroom',
      '2BR': '2 Bedroom',
      '3BR': '3 Bedroom',
      'STUDIO': 'Studio',
      'OFFICE': 'Office Space',
      'RETAIL': 'Retail Shop'
    };
    return typeMap[type ?? ''] ?? type ?? 'Unit';
  }

  getTenantDisplay(unit: Unit): string {
    return unit.tenant?.name ?? unit.tenant?.email ?? 'No tenant';
  }

  quickAddProperty() {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  quickAddTenant() {
    this.snackBar.open('Add tenant feature coming soon!', 'Close', { duration: 3000 });
  }

  quickRecordPayment() {
    this.snackBar.open('Record payment feature coming soon!', 'Close', { duration: 3000 });
  }

  quickGenerateReport() {
    this.snackBar.open('Generate report feature coming soon!', 'Close', { duration: 3000 });
  }

  hasData(): boolean {
    return this.allProperties.length > 0;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getUserDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'Landlord';
    if (user.fullName) {
      const nameParts = user.fullName.split(' ');
      return nameParts[0] || user.fullName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Landlord';
  }

  getUserFullName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || 'Landlord';
  }

  getUserRoleDisplay(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'Landlord';
    const roleMap: { [key: string]: string } = {
      'LANDLORD': 'Landlord',
      'TENANT': 'Tenant',
      'CARETAKER': 'Caretaker',
      'BUSINESS': 'Business',
      'ADMIN': 'Administrator'
    };
    return roleMap[user.role] || user.role;
  }
}