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
      next: (properties) => {
        this.properties = properties;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load properties';
        this.loading = false;
      }
    });
  }

  viewPropertyDetails(propertyId: number): void {
    this.router.navigate(['/caretaker/properties', propertyId]);
  }

  manageUnits(propertyId: number): void {
    this.router.navigate(['/caretaker/properties', propertyId, 'units']);
  }

  getOccupancyRate(property: Property): number {
    if (!property.units || property.units.length === 0) return 0;
    const occupied = property.units.filter(unit => unit.isOccupied).length;
    return Math.round((occupied / property.units.length) * 100);
  }
}