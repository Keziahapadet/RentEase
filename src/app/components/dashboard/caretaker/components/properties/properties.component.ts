import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CaretakerService } from '../../../../../services/caretaker.service';

export interface Unit {
  id: number;
  unitNumber: string;
  unitType: string;
  description: string;
  rentAmount: number;
  deposit: number;
  isOccupied: boolean;
  propertyId: number;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  units: Unit[];
}

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatDialogModule],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  selectedProperty: Property | null = null;
  units: Unit[] = [];
  displayedColumns: string[] = ['unitNumber', 'unitType', 'description', 'rentAmount', 'deposit', 'status', 'actions'];

  constructor(
    private caretakerService: CaretakerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    // For demo purposes - replace with actual service call
    this.properties = [
      {
        id: 1,
        name: 'Green Valley Apartments',
        address: '123 Main Street, Nairobi',
        units: [
          {
            id: 1,
            unitNumber: 'A1',
            unitType: '2 Bedroom',
            description: 'Spacious 2 bedroom with balcony',
            rentAmount: 35000,
            deposit: 70000,
            isOccupied: true,
            propertyId: 1
          },
          {
            id: 2,
            unitNumber: 'A2',
            unitType: '1 Bedroom',
            description: 'Cozy 1 bedroom apartment',
            rentAmount: 25000,
            deposit: 50000,
            isOccupied: false,
            propertyId: 1
          },
          {
            id: 3,
            unitNumber: 'B1',
            unitType: 'Studio',
            description: 'Modern studio apartment',
            rentAmount: 18000,
            deposit: 36000,
            isOccupied: true,
            propertyId: 1
          }
        ]
      },
      {
        id: 2,
        name: 'Sunrise Villas',
        address: '456 Park Avenue, Westlands',
        units: [
          {
            id: 4,
            unitNumber: 'Villa 1',
            unitType: '3 Bedroom',
            description: 'Luxury 3 bedroom villa',
            rentAmount: 80000,
            deposit: 160000,
            isOccupied: true,
            propertyId: 2
          },
          {
            id: 5,
            unitNumber: 'Villa 2',
            unitType: '2 Bedroom',
            description: 'Beautiful 2 bedroom villa',
            rentAmount: 60000,
            deposit: 120000,
            isOccupied: false,
            propertyId: 2
          }
        ]
      },
      {
        id: 3,
        name: 'City Towers',
        address: '789 Business District, CBD',
        units: [
          {
            id: 6,
            unitNumber: 'Tower 501',
            unitType: 'Penthouse',
            description: 'Luxury penthouse with city views',
            rentAmount: 150000,
            deposit: 300000,
            isOccupied: true,
            propertyId: 3
          },
          {
            id: 7,
            unitNumber: 'Tower 302',
            unitType: '1 Bedroom',
            description: 'Modern 1 bedroom in city center',
            rentAmount: 30000,
            deposit: 60000,
            isOccupied: false,
            propertyId: 3
          }
        ]
      }
    ];

    if (this.properties.length > 0) {
      this.selectProperty(this.properties[0]);
    }

    // Uncomment for actual service call:
    // this.caretakerService.getProperties().subscribe(properties => {
    //   this.properties = properties;
    //   if (properties.length > 0) {
    //     this.selectProperty(properties[0]);
    //   }
    // });
  }

  selectProperty(property: Property): void {
    this.selectedProperty = property;
    this.loadPropertyUnits(property.id);
  }

  loadPropertyUnits(propertyId: number): void {
    // For demo purposes - replace with actual service call
    const property = this.properties.find(p => p.id === propertyId);
    this.units = property ? property.units : [];
    
    // Uncomment for actual service call:
    // this.caretakerService.getPropertyUnits(propertyId).subscribe(units => {
    //   this.units = units;
    // });
  }

  openAddUnitDialog(): void {
    if (!this.selectedProperty) return;

    // For demo purposes - simple implementation
    const unitNumber = prompt('Enter unit number:');
    const unitType = prompt('Enter unit type:');
    const description = prompt('Enter description:');
    const rentAmount = prompt('Enter rent amount:');
    const deposit = prompt('Enter deposit amount:');

    if (unitNumber && unitType && description && rentAmount && deposit) {
      const newUnit: Unit = {
        id: this.units.length + 1,
        unitNumber,
        unitType,
        description,
        rentAmount: Number(rentAmount),
        deposit: Number(deposit),
        isOccupied: false,
        propertyId: this.selectedProperty.id
      };

      this.units.push(newUnit);
      // Also add to the property's units array for consistency
      this.selectedProperty.units.push(newUnit);
    }

    // Uncomment for actual dialog implementation:
    // const dialogRef = this.dialog.open(AddUnitDialogComponent, {
    //   width: '500px',
    //   data: { propertyId: this.selectedProperty.id }
    // });
    // 
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.caretakerService.createUnit(this.selectedProperty!.id, result).subscribe(newUnit => {
    //       this.units.push(newUnit);
    //     });
    //   }
    // });
  }

  inviteTenant(unit: Unit): void {
    const tenantEmail = prompt('Enter tenant email:');
    if (tenantEmail) {
      // For demo purposes - replace with actual service call
      alert(`Invitation sent to ${tenantEmail} for unit ${unit.unitNumber}`);
      
      // Uncomment for actual service call:
      // this.caretakerService.inviteTenant(tenantEmail, unit.id).subscribe({
      //   next: () => {
      //     alert('Invitation sent successfully!');
      //   },
      //   error: (error) => {
      //     alert('Error sending invitation: ' + error.message);
      //   }
      // });
    }
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  getOccupiedUnitsCount(property: Property): number {
    return property.units.filter(unit => unit.isOccupied).length;
  }
}