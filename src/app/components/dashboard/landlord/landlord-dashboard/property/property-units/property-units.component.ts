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
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PropertyService } from '../../../../../../services/property.service';
import { AuthService } from '../../../../../../services/auth.service';
import { InvitationService } from '../../../../../../services/invitation.service';
import { Property, Unit } from '../../../../../../services/dashboard-interface';
import { InviteDialogComponent } from '../../invite-dialog/invite-dialog.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './property-units.component.html',
  styleUrls: ['./property-units.component.scss'],
   providers: [InvitationService]
})
export class PropertyUnitsComponent implements OnInit {
  propertyId!: string;
  property!: Property;
  units: Unit[] = [];
  filteredUnits: Unit[] = [];
  loading = true;
  errorMessage = '';

  searchTerm = '';
  activeFilter = 'all';

  totalUnits = 0;
  occupiedUnits = 0;
  vacantUnits = 0;
  maintenanceUnits = 0;
  occupancyRate = 0;
  monthlyRevenue = 0;
  annualRevenue = 0;

  displayedColumns: string[] = ['unitNumber', 'type', 'rent', 'status', 'tenant', 'actions'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.propertyId = this.getPropertyIdFromRoute();
    
    if (this.propertyId) {
      this.loadPropertyAndUnits();
    } else {
      this.errorMessage = 'No property ID provided';
      this.snackBar.open('Property ID is missing. Please select a property first.', 'Close', { duration: 3000 });
      this.router.navigate(['/landlord-dashboard/property']);
    }
  }

  private getPropertyIdFromRoute(): string {
    let propertyId = this.route.snapshot.paramMap.get('propertyId') || 
                    this.route.snapshot.paramMap.get('id') ||
                    this.route.parent?.snapshot.paramMap.get('propertyId') ||
                    this.route.parent?.snapshot.paramMap.get('id') ||
                    '';
    return propertyId;
  }

  loadPropertyAndUnits() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      property: this.propertyService.getPropertyById(this.propertyId).pipe(
        catchError(error => {
          return of(null);
        })
      ),
      units: this.propertyService.getPropertyUnits(this.propertyId).pipe(
        catchError(error => {
          return of([]);
        })
      )
    }).subscribe({
      next: (result) => {
        if (!result.property) {
          this.handleError('Property not found or failed to load', { status: 404 });
          return;
        }

        this.property = result.property;
        this.units = result.units || [];
        
        this.units = this.units.map(unit => {
          if (!unit.status) {
            unit.status = unit.tenant ? 'occupied' : 'vacant';
          }
          return unit;
        });
        
        this.filteredUnits = [...this.units];
        this.calculateStats();
        this.loading = false;

        if (this.units.length === 0) {
          this.snackBar.open('No units found for this property', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        this.handleError('Failed to load property details or units', error);
      }
    });
  }

  private calculateStats() {
    this.totalUnits = this.units.length;
    this.occupiedUnits = this.units.filter(unit => unit.status === 'occupied').length;
    this.vacantUnits = this.units.filter(unit => unit.status !== 'occupied').length;
    this.maintenanceUnits = this.units.filter(unit => unit.status === 'maintenance').length;

    this.occupancyRate = this.totalUnits > 0 ? Math.round((this.occupiedUnits / this.totalUnits) * 100) : 0;

    this.monthlyRevenue = this.units
      .filter(unit => unit.status === 'occupied')
      .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);

    this.annualRevenue = this.monthlyRevenue * 12;
  }

  inviteTenantToProperty(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const availableUnits = this.units.filter(unit => 
      unit.status !== 'occupied'
    );
    
    if (availableUnits.length === 0) {
      this.snackBar.open('No available units for tenant invitation. All units are currently occupied.', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'responsive-dialog',
      data: {
        type: 'tenant',
        propertyId: this.propertyId,
        propertyName: this.property?.name,
        availableUnits: availableUnits
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendTenantInvitation(result);
      }
    });
  }

  inviteTenantToUnit(unit: Unit, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'responsive-dialog',
      data: {
        type: 'tenant',
        propertyId: this.propertyId,
        propertyName: this.property?.name,
        availableUnits: [unit]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendTenantInvitation(result);
      }
    });
  }

  private sendTenantInvitation(inviteData: any) {
    this.invitationService.inviteTenant(inviteData).subscribe({
      next: () => {
        this.snackBar.open('Tenant invitation sent successfully!', 'Close', { duration: 4000 });
        this.loadPropertyAndUnits();
      },
      error: (error) => {
        console.error('Error sending tenant invitation:', error);
        const errorMessage = error?.error?.message || 'Failed to send tenant invitation';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  navigateToTotalUnits() {
    this.activeFilter = 'all';
    this.applyFilter();
    this.snackBar.open('Showing all units', 'Close', { duration: 2000 });
  }

  navigateToOccupiedUnits() {
    this.activeFilter = 'occupied';
    this.applyFilter();
    this.snackBar.open('Showing occupied units', 'Close', { duration: 2000 });
  }

  navigateToVacantUnits() {
    this.activeFilter = 'vacant';
    this.applyFilter();
    this.snackBar.open('Showing vacant units', 'Close', { duration: 2000 });
  }

  navigateToMaintenanceUnits() {
    this.activeFilter = 'maintenance';
    this.applyFilter();
    this.snackBar.open('Showing maintenance units', 'Close', { duration: 2000 });
  }

  navigateToOccupancyAnalytics() {
    this.snackBar.open('Occupancy analytics feature coming soon!', 'Close', { duration: 3000 });
  }

  navigateToRevenueAnalytics() {
    this.snackBar.open('Revenue analytics feature coming soon!', 'Close', { duration: 3000 });
  }

  private handleError(message: string, error: any) {
    this.loading = false;

    if (error.status === 401) {
      this.errorMessage = 'Authentication failed. Please log in again.';
      this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 5000 });
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 404) {
      this.errorMessage = 'Property not found. It may have been deleted.';
      this.snackBar.open('Property not found.', 'Close', { duration: 4000 });
      setTimeout(() => {
        this.router.navigate(['/landlord-dashboard/property']);
      }, 2000);
    } else if (error.status === 403) {
      this.errorMessage = 'You do not have permission to view this property.';
      this.snackBar.open('Access denied to this property.', 'Close', { duration: 4000 });
      setTimeout(() => {
        this.router.navigate(['/landlord-dashboard/property']);
      }, 2000);
    } else {
      this.errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
      this.snackBar.open(`${message}: ${this.errorMessage}`, 'Close', { duration: 5000 });
    }
  }

  goBackToProperty() {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId]);
  }

  goBackToProperties() {
    this.router.navigate(['/landlord-dashboard/property']);
  }

  onSearchChange() {
    this.applyFilter();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  clearFilters() {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.applyFilter();
    this.snackBar.open('Filters cleared', 'Close', { duration: 2000 });
  }

  private applyFilter() {
    let filtered = [...this.units];

    if (this.activeFilter === 'occupied') {
      filtered = filtered.filter(unit => unit.status === 'occupied');
    } else if (this.activeFilter === 'vacant') {
      filtered = filtered.filter(unit => unit.status !== 'occupied');
    } else if (this.activeFilter === 'maintenance') {
      filtered = filtered.filter(unit => unit.status === 'maintenance');
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(unit =>
        (unit.unitNumber?.toLowerCase() || '').includes(searchLower) ||
        (unit.unitType?.toLowerCase() || '').includes(searchLower) ||
        (unit.description?.toLowerCase() || '').includes(searchLower) ||
        (unit.tenant?.name?.toLowerCase() || '').includes(searchLower) ||
        (unit.tenant?.email?.toLowerCase() || '').includes(searchLower)
      );
    }

    this.filteredUnits = filtered;
  }

  viewUnit(unitId: string | number) {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit', unitId]);
  }

  editUnit(unitId: string | number) {
    this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit', unitId, 'edit']);
  }

  createNewUnit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
      this.router.navigate(['/landlord-dashboard/property', this.propertyId, 'unit', 'create']);
  }

  onDeleteUnit(unitId: string | number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (isPlatformBrowser(this.platformId) && confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      this.propertyService.deleteUnit(this.propertyId, unitId.toString()).subscribe({
        next: () => {
          this.snackBar.open('Unit deleted successfully', 'Close', { duration: 3000 });
          this.loadPropertyAndUnits();
        },
        error: (error: any) => {
          const msg = error?.error?.message || error?.message || 'Failed to delete unit';
          this.snackBar.open(msg, 'Close', { duration: 4000 });
        }
      });
    }
  }

  refreshUnits() {
    this.loadPropertyAndUnits();
    this.snackBar.open('Refreshing units...', 'Close', { duration: 2000 });
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'occupied': return 'occupied';
      case 'vacant': return 'vacant';
      case 'maintenance': return 'maintenance';
      case 'reserved': return 'reserved';
      default: return 'vacant';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'occupied': return 'person';
      case 'vacant': return 'event_available';
      case 'maintenance': return 'build';
      case 'reserved': return 'schedule';
      default: return 'event_available';
    }
  }

  getStatusDisplay(status: string | undefined): string {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'vacant': return 'Vacant';
      case 'maintenance': return 'Maintenance';
      case 'reserved': return 'Reserved';
      default: return 'Vacant';
    }
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
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount.toLocaleString()}`;
  }

  getTenantDisplay(unit: Unit): string {
    return unit.tenant?.name || unit.tenant?.email || 'No tenant';
  }

  getUnitTypeDisplay(unit: Unit): string {
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
    return typeMap[unit.unitType || ''] || unit.unitType || 'Unit';
  }

  getFilteredCount(): string {
    if (this.filteredUnits.length === this.units.length) {
      return `${this.units.length} units`;
    } else {
      return `${this.filteredUnits.length} of ${this.units.length} units`;
    }
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.activeFilter !== 'all';
  }

  getPropertyTypeDisplay(): string {
    const typeMap: { [key: string]: string } = {
      'APARTMENT': 'Apartment',
      'HOUSE': 'Single House',
      'BUNGALOW': 'Bungalow',
      'COMMERCIAL': 'Commercial Building',
      'CONDO': 'Condominium',
      'TOWNHOUSE': 'Townhouse',
      'MIXED': 'Mixed Use'
    };
    return typeMap[this.property?.propertyType || ''] || this.property?.propertyType || 'Property';
  }
}