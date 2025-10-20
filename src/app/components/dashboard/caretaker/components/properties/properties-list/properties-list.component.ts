import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CaretakerService, Property } from '../../../../../../services/caretaker.service';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.scss']
})
export class PropertiesListComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  error = '';

  constructor(
    private caretakerService: CaretakerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.caretakerService.getProperties().subscribe({
      next: (response) => {
        // Handle both array response and object with data property
        if (Array.isArray(response)) {
          this.properties = response;
        } else if (response && Array.isArray((response as any).data)) {
          this.properties = (response as any).data;
        } else {
          this.properties = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load properties';
        this.loading = false;
        console.error('Error loading properties:', error);
      }
    });
  }

  viewPropertyDetails(propertyId: number): void {
    this.router.navigate(['/caretaker-dashboard/properties', propertyId]);
  }

  viewUnits(propertyId: number): void {
    this.router.navigate(['/caretaker-dashboard/properties', propertyId, 'units']);
  }

  manageUnits(propertyId: number): void {
    this.router.navigate(['/caretaker-dashboard/properties', propertyId, 'units'], {
      queryParams: { manage: 'true' }
    });
  }

  getTotalUnits(property: Property): number {
    return Array.isArray(property.units) ? property.units.length : 0;
  }

  getOccupancyRate(property: Property): number {
    const units = Array.isArray(property.units) ? property.units : [];
    if (units.length === 0) return 0;
    const occupied = units.filter(unit => unit.isOccupied).length;
    return Math.round((occupied / units.length) * 100);
  }

  getAvailableUnits(property: Property): number {
    const units = Array.isArray(property.units) ? property.units : [];
    const available = units.filter(unit => !unit.isOccupied).length;
    return available;
  }
}