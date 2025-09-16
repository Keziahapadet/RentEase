import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../../../services/property.service';
import { Property } from '../../../../../models/property.model';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css']
})
export class PropertyComponent implements OnInit {
  properties: Property[] = [];
  isLoading = false;
  searchTerm = '';
  filterStatus = 'all';
  error: string | null = null;

  constructor(
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  /**
   * Load properties from service - CONNECTED TO BACKEND
   */
  loadProperties(): void {
    this.isLoading = true;
    this.error = null;
    
    this.propertyService.getProperties().subscribe({
      next: (properties) => {
        this.properties = properties.map(prop => ({
          ...prop,
          status: prop.status || 'Active',
          occupiedUnits: Math.floor(Math.random() * prop.totalUnits), // Temporary until backend provides this
          monthlyRevenue: Math.floor(Math.random() * 50000) + 20000 // Temporary until backend provides this
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.error = error.message;
        this.isLoading = false;
        // Fallback to empty array on error
        this.properties = [];
      }
    });
  }

  /**
   * Navigate to create new property - USING SINGULAR PROPERTY PATH
   */
  createNewProperty(): void {
    this.router.navigate(['/landlord-dashboard/property/create']);
  }

  /**
   * Edit property
   */
  editProperty(propertyId: string): void {
    console.log('Edit property:', propertyId);
    // TODO: Implement when edit component is ready
    // this.router.navigate(['/landlord-dashboard/property/edit', propertyId]);
  }

  /**
   * View property details
   */
  viewProperty(propertyId: string): void {
    console.log('View property:', propertyId);
    // TODO: Implement when detail component is ready
    // this.router.navigate(['/landlord-dashboard/property', propertyId]);
  }

  /**
   * Delete property - CONNECTED TO BACKEND
   */
  deleteProperty(propertyId: string): void {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.propertyService.deleteProperty(propertyId).subscribe({
        next: () => {
          // Remove from local array after successful deletion
          this.properties = this.properties.filter(p => p.id !== propertyId);
          this.isLoading = false;
          console.log('Property deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          this.error = `Failed to delete property: ${error.message}`;
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Get occupancy rate for a property
   */
  getOccupancyRate(property: any): number {
    if (property.totalUnits === 0) return 0;
    return Math.round((property.occupiedUnits / property.totalUnits) * 100);
  }

  /**
   * Get occupancy status class
   */
  getOccupancyClass(property: any): string {
    const rate = this.getOccupancyRate(property);
    if (rate >= 90) return 'high';
    if (rate >= 70) return 'medium';
    return 'low';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Filter properties based on search term and status
   */
  get filteredProperties() {
    return this.properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           property.propertyType.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' || 
                           property.status.toLowerCase() === this.filterStatus.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Refresh properties list
   */
  refreshProperties(): void {
    this.loadProperties();
  }

  /**
   * Export properties data
   */
  exportProperties(): void {
    console.log('Exporting properties data...');
    const dataStr = JSON.stringify(this.properties, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'properties.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}