import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertyService } from '../../../../../services/property.service';
import { Property, Unit } from '../../../../../services/auth-interfaces';

@Component({
  selector: 'app-property-units',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {
  propertyId!: string;
  property: Property | null = null;
  units: Unit[] = [];
  filteredUnits: Unit[] = [];
  loading = true;
  errorMessage = '';

 
  searchTerm = '';
  activeFilter = 'all';

  
  totalUnits = 0;
  occupiedUnits = 0;
  occupancyRate = 0;
  monthlyRevenue = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.propertyId) {
      this.loadPropertyAndUnits();
    } else {
      this.router.navigate(['/landlord-dashboard/property']);
    }
  }

  private loadPropertyAndUnits() {
    this.loading = true;
    this.errorMessage = '';

    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (property: Property) => {
        this.property = property;
        this.loadUnits();
      },
      error: (error: any) => {
        this.handleError('Failed to load property details', error);
      }
    });
  }

  private loadUnits() {
    this.propertyService.getPropertyUnits(this.propertyId).subscribe({
      next: (response: any) => {
        try {
          let unitsData: Unit[] = [];

          if (Array.isArray(response)) {
            unitsData = response;
          } else if (response?.data && Array.isArray(response.data)) {
            unitsData = response.data;
          } else if (response?.units && Array.isArray(response.units)) {
            unitsData = response.units;
          }

          this.units = unitsData.map((unit: any) => ({
            id: unit.id,
            unitNumber: unit.unitNumber ?? unit.id?.toString() ?? '1',
            unitType: unit.unitType ?? unit.type ?? '1BR',
            rentAmount: Number(unit.rentAmount ?? unit.rent ?? 25000),
            deposit: Number(unit.deposit ?? 25000),
            unitDescription: unit.unitDescription ?? unit.description ?? '',
            status: unit.status ?? this.generateRandomStatus(),
            tenant: unit.status === 'occupied' || unit.tenant
              ? (unit.tenant ?? this.generateRandomTenant())
              : null,
            createdAt: unit.createdAt ?? null,
            updatedAt: unit.updatedAt ?? null
          }));

          this.filteredUnits = [...this.units];
          this.calculateStats();
          this.loading = false;
        } catch (err: any) {
          this.handleError(`Parse error: ${err?.message ?? err}`, err);
        }
      },
      error: (error: any) => {
        this.handleError('Failed to load units', error);
      }
    });
  }

  private generateRandomStatus(): 'occupied' | 'vacant' | 'maintenance' | 'reserved' {
    const statuses: ('occupied' | 'vacant' | 'maintenance' | 'reserved')[] = ['occupied', 'vacant', 'maintenance', 'reserved'];
    const weights = [0.7, 0.2, 0.07, 0.03];
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return statuses[i];
    }
    return 'vacant';
  }

  private generateRandomTenant(): { name: string; email: string } {
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const email = randomName.toLowerCase().replace(/\s/g, '.') + '@email.com';
    return { name: randomName, email };
  }

  private calculateStats() {
    this.totalUnits = this.units.length;
    this.occupiedUnits = this.units.filter(unit => unit.status === 'occupied').length;
    this.occupancyRate = this.totalUnits > 0 ? Math.round((this.occupiedUnits / this.totalUnits) * 100) : 0;
    this.monthlyRevenue = this.units
      .filter(unit => unit.status === 'occupied')
      .reduce((sum, unit) => sum + (unit.rentAmount ?? 0), 0);
  }

  private handleError(message: string, error: any) {
    this.loading = false;
    this.errorMessage = typeof error === 'string' ? error : error?.message ?? JSON.stringify(error);
    this.snackBar.open(`${message}: ${this.errorMessage}`, 'Close', { 
      duration: 4000, 
      panelClass: ['snack-error'] 
    });
  }

  

  navigateToTotalUnits() {
    this.activeFilter = 'all';
    this.applyFilter();
    this.snackBar.open('Showing all units', 'Close', { duration: 2000, panelClass: ['snack-info'] });
  }

  navigateToOccupiedUnits() {
    this.activeFilter = 'occupied';
    this.applyFilter();
    this.snackBar.open('Showing occupied units only', 'Close', { duration: 2000, panelClass: ['snack-info'] });
  }

  navigateToOccupancyAnalytics() {
    this.router.navigate(['/landlord-dashboard/analytics/occupancy'], { 
      queryParams: { 
        propertyId: this.propertyId,
        propertyName: this.property?.name ?? '',
        occupancyRate: this.occupancyRate
      } 
    });
  }

  navigateToRevenueAnalytics() {
    this.router.navigate(['/landlord-dashboard/analytics/revenue'], { 
      queryParams: { 
        propertyId: this.propertyId,
        propertyName: this.property?.name ?? '',
        monthlyRevenue: this.monthlyRevenue
      } 
    });
  }


  goBackToProperties() {
    this.router.navigate(['/landlord-dashboard/property']);
  }

  goBackToProperty() {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId]);
  }


  onSearchChange() {
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    let filtered = [...this.units];

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === this.activeFilter);
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(unit =>
        (unit.unitNumber?.toLowerCase() ?? '').includes(searchLower) ||
        (unit.unitType?.toLowerCase() ?? '').includes(searchLower) ||
        (unit.description?.toLowerCase() ?? '').includes(searchLower) ||
        (unit.tenant?.name?.toLowerCase() ?? '').includes(searchLower) ||
        (unit.tenant?.email?.toLowerCase() ?? '').includes(searchLower)
      );
    }

    this.filteredUnits = filtered;
  }



  viewUnit(unitId: string | number) {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit', unitId]);
  }

  editUnit(unitId: string | number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit', unitId, 'edit']);
  }

  createNewUnit() {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit/create']);
  }

  onDeleteUnit(unitId: string | number, event: Event) {
    event.stopPropagation();
    if (isPlatformBrowser(this.platformId) && confirm('Are you sure you want to delete this unit?')) {
      this.propertyService.deleteUnit(this.propertyId, unitId.toString()).subscribe({
        next: () => {
          this.snackBar.open('Unit deleted successfully', 'Close', { duration: 3000, panelClass: ['snack-success'] });
          this.loadUnits();
        },
        error: (error: any) => {
          const msg = error?.message ?? 'Failed to delete unit';
          this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: ['snack-error'] });
        }
      });
    }
  }

  refreshUnits() {
    this.loadPropertyAndUnits();
    this.snackBar.open('Units refreshed', 'Close', { duration: 2000, panelClass: ['snack-info'] });
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

  formatCurrency(amount: number | undefined | null): string {
    if (amount == null) return 'KES 0';
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  }

  formatCompactCurrency(amount: number | undefined | null): string {
    if (amount == null) return 'KES 0';
    if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
    return `KES ${amount.toLocaleString()}`;
  }

  getTenantDisplay(unit: Unit): string {
    return unit.tenant?.name ?? unit.tenant?.email ?? '-';
  }

  getUnitDescription(unit: Unit): string {
    return unit.description?.length
      ? unit.description.length > 30
        ? unit.description.substring(0, 30) + '...'
        : unit.description
      : '-';
  }

  getLastPaymentDate(unit: Unit): string {
    if (unit.status === 'occupied') {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - daysAgo);
      return paymentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return '-';
  }

  getUnitTypeDisplay(unit: Unit): string {
    const typeMap: { [key: string]: string } = {
      'SINGLE': 'Single Room',
      'BEDSITTER': 'Bedsitter',
      '1BR': '1 Bedroom',
      '2BR': '2 Bedroom',
      '3BR': '3 Bedroom',
      'OFFICE': 'Office Space'
    };
    return typeMap[unit.unitType ?? ''] ?? unit.unitType ?? 'Apartment';
  }
}
