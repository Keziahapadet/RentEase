import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CaretakerService, Property } from '../../../../../../services/caretaker.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss']
})
export class PropertyDetailsComponent implements OnInit {
  property: Property | null = null;
  loading = true;
  error = '';

  // Statistics properties
  totalUnits = 0;
  occupancyRate = 0;
  vacantUnits = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caretakerService: CaretakerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const propertyId = +params['id'];
      this.loadPropertyDetails(propertyId);
    });
  }

  loadPropertyDetails(propertyId: number): void {
    this.caretakerService.getPropertyDetails(propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load property details';
        this.loading = false;
        console.error('Error loading property details:', error);
      }
    });
  }

  private calculateStatistics(): void {
    if (!this.property?.units) {
      this.totalUnits = 0;
      this.occupancyRate = 0;
      this.vacantUnits = 0;
      return;
    }

    this.totalUnits = this.property.units.length;
    const occupiedUnits = this.property.units.filter(unit => unit.isOccupied).length;
    this.vacantUnits = this.totalUnits - occupiedUnits;
    this.occupancyRate = this.totalUnits > 0 ? Math.round((occupiedUnits / this.totalUnits) * 100) : 0;
  }

  goBack(): void {
    this.router.navigate(['/caretaker/properties']);
  }

  manageUnits(): void {
    if (this.property) {
      this.router.navigate(['/caretaker/properties', this.property.id, 'units']);
    }
  }
}