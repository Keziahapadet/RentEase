import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CaretakerService, Unit } from '../../../../../../services/caretaker.service';

@Component({
  selector: 'app-all-units',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './all-units.component.html',
  styleUrls: ['./all-units.component.scss']
})
export class AllUnitsComponent implements OnInit {
  units: Unit[] = [];
  loading = true;
  error = '';

  // Statistics properties
  totalUnits = 0;
  occupiedUnits = 0;
  vacantUnits = 0;
  totalProperties = 0;

  constructor(
    private caretakerService: CaretakerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllUnits();
  }

  loadAllUnits(): void {
    this.caretakerService.getAllUnits().subscribe({
      next: (units) => {
        this.units = units;
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load units';
        this.loading = false;
        console.error('Error loading units:', error);
      }
    });
  }

  private calculateStatistics(): void {
    this.totalUnits = this.units.length;
    this.occupiedUnits = this.units.filter(u => u.isOccupied).length;
    this.vacantUnits = this.totalUnits - this.occupiedUnits;
    
    // Calculate unique properties
    const uniquePropertyIds = new Set(this.units.map(u => u.propertyId));
    this.totalProperties = uniquePropertyIds.size;
  }

  viewProperty(propertyId: number): void {
    this.router.navigate(['/caretaker/properties', propertyId]);
  }
}