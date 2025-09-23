import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PropertyService } from '../../../../../services/property.service';
import { Property } from '../../../../../services/auth-interfaces';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, MatChipsModule],
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  errorMessage = '';

  totalProperties = 0;
  totalUnits = 0;
  occupiedUnits = 0;
  totalRevenue = 0;

  constructor(private router: Router, private propertyService: PropertyService) {}

  ngOnInit() {
    this.loadProperties();
  }

  // ---------------- TYPE GUARDS ----------------
  private isPropertyArray(obj: any): obj is Property[] {
    return Array.isArray(obj);
  }

  private hasData(obj: any): obj is { data: Property[] } {
    return obj && Array.isArray(obj.data);
  }

  private hasProperties(obj: any): obj is { properties: Property[] } {
    return obj && Array.isArray(obj.properties);
  }

  private hasContent(obj: any): obj is { content: Property[] } {
    return obj && Array.isArray(obj.content);
  }

  // ---------------- LOAD PROPERTIES ----------------
  private loadProperties() {
    this.loading = true;
    this.errorMessage = '';

    this.propertyService.getProperties().subscribe({
      next: (response) => {
        let propertiesData: Property[] = [];

        if (this.isPropertyArray(response)) propertiesData = response;
        else if (this.hasData(response)) propertiesData = response.data;
        else if (this.hasProperties(response)) propertiesData = response.properties;
        else if (this.hasContent(response)) propertiesData = response.content;

        this.properties = propertiesData;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.properties = [];
        this.errorMessage = error.message || 'Failed to load properties';
      }
    });
  }

  private calculateStats() {
    this.totalProperties = this.properties.length;
    this.totalUnits = this.properties.reduce((sum, prop) => sum + (prop.totalUnits || 0), 0);
    this.occupiedUnits = Math.floor(this.totalUnits * 0.85);
    this.totalRevenue = this.totalUnits * 25000;
  }

  // ---------------- NAVIGATION ----------------
  createNewProperty() {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  viewProperty(propertyId: string | number) {
    this.router.navigate(['/landlord-dashboard/property', propertyId]);
  }

  editProperty(propertyId: string | number) {
    this.router.navigate(['/landlord-dashboard/property', propertyId, 'edit']);
  }

  onDeleteProperty(propertyId: string | number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyService.deleteProperty(propertyId.toString()).subscribe({
        next: () => this.loadProperties(),
        error: (error) => alert('Failed to delete property: ' + error.message)
      });
    }
  }

  refreshProperties() {
    this.loadProperties();
  }

  // ---------------- UTILITIES ----------------
  getPropertyTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      APARTMENT: 'Apartment',
      HOUSE: 'House',
      bungallow: 'Bungalow',
      COMMERCIAL: 'Commercial',
      CONDO: 'Condominium',
      TOWNHOUSE: 'Townhouse'
    };
    return typeLabels[type] || type;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return dateString
      ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'N/A';
  }

  getOccupancyRate(property: Property): number {
    if (!property.totalUnits || property.totalUnits === 0) return 0;
    const occupied = Math.floor(property.totalUnits * 0.85);
    return Math.round((occupied / property.totalUnits) * 100);
  }

  // ---------------- MISSING METHODS FROM HTML ----------------
  getOccupiedUnits(property: Property): number {
    return property.totalUnits ? Math.floor(property.totalUnits * 0.85) : 0;
  }

  getMonthlyRevenue(property: Property): number {
    return property.totalUnits ? property.totalUnits * 25000 : 0;
  }

  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'inactive': return 'pause_circle';
      case 'maintenance': return 'build';
      default: return 'help_outline';
    }
  }

  onToggleStatus(propertyId: string | number, status: string | undefined, event: Event) {
    event.stopPropagation();
    alert(`Toggle status for property ${propertyId} from ${status}`);
  }
}
