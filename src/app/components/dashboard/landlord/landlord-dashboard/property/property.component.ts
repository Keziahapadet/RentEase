// property.component.ts (Main Property List)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface Property {
  id: number;
  name: string;
  location: string;
  propertyType: string;
  totalUnits: number;
  occupiedUnits: number;
  description?: string;
  monthlyRevenue: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdDate: string;
}

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css']
})
export class PropertyComponent implements OnInit {
  properties: Property[] = [];
  loading = true;

  // Stats for the header
  totalProperties = 0;
  totalUnits = 0;
  occupiedUnits = 0;
  totalRevenue = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProperties();
  }

  private loadProperties() {
    // Simulate API call
    setTimeout(() => {
      this.properties = [
        {
          id: 1,
          name: 'Sunrise Apartments',
          location: 'Westlands, Nairobi',
          propertyType: 'APARTMENT',
          totalUnits: 24,
          occupiedUnits: 22,
          description: 'Modern apartment complex with amenities',
          monthlyRevenue: 480000,
          status: 'active',
          createdDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Green Valley Townhouses',
          location: 'Karen, Nairobi',
          propertyType: 'TOWNHOUSE',
          totalUnits: 12,
          occupiedUnits: 10,
          description: 'Luxury townhouses with gardens',
          monthlyRevenue: 360000,
          status: 'active',
          createdDate: '2024-02-20'
        },
        {
          id: 3,
          name: 'Downtown Office Complex',
          location: 'CBD, Nairobi',
          propertyType: 'COMMERCIAL',
          totalUnits: 8,
          occupiedUnits: 6,
          description: 'Prime commercial office space',
          monthlyRevenue: 240000,
          status: 'maintenance',
          createdDate: '2023-11-10'
        },
        {
          id: 4,
          name: 'Riverside Condos',
          location: 'Kilimani, Nairobi',
          propertyType: 'CONDO',
          totalUnits: 18,
          occupiedUnits: 18,
          description: 'Luxury condominiums with river views',
          monthlyRevenue: 540000,
          status: 'active',
          createdDate: '2023-08-05'
        }
      ];

      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  private calculateStats() {
    this.totalProperties = this.properties.length;
    this.totalUnits = this.properties.reduce((sum, prop) => sum + prop.totalUnits, 0);
    this.occupiedUnits = this.properties.reduce((sum, prop) => sum + prop.occupiedUnits, 0);
    this.totalRevenue = this.properties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0);
  }

  // Navigation methods
  createNewProperty() {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  viewProperty(propertyId: number) {
    this.router.navigate(['/landlord-dashboard/property', propertyId]);
  }

  editProperty(propertyId: number) {
    this.router.navigate(['/landlord-dashboard/property', propertyId, 'edit']);
  }

  // Utility methods
  getPropertyTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'APARTMENT': 'Apartment',
      'HOUSE': 'House',
      'COMMERCIAL': 'Commercial',
      'CONDO': 'Condominium',
      'TOWNHOUSE': 'Townhouse'
    };
    return typeLabels[type] || type;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      case 'maintenance': return 'accent';
      default: return 'primary';
    }
  }

  getOccupancyRate(property: Property): number {
    return Math.round((property.occupiedUnits / property.totalUnits) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Action methods
  onDeleteProperty(propertyId: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this property?')) {
      // Implement delete logic
      console.log('Delete property:', propertyId);
    }
  }

  onToggleStatus(propertyId: number, event: Event) {
    event.stopPropagation();
    // Implement status toggle logic
    console.log('Toggle status for property:', propertyId);
  }

  refreshProperties() {
    this.loading = true;
    this.loadProperties();
  }
}