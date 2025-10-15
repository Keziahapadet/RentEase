import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Property } from '../../../../../../models/property.model';

@Component({
  selector: 'app-properties-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './properties-view.component.html',
  styleUrls: ['./properties-view.component.scss']
})
export class PropertiesViewComponent {
  @Input() properties: Property[] = [];
  @Input() totalProperties: number = 0;
  @Input() occupiedPropertiesCount: number = 0;
  @Input() vacantPropertiesCount: number = 0;
  
  @Output() viewPropertyDetails = new EventEmitter<Property>();
  @Output() editProperty = new EventEmitter<Property>();

  displayedColumns: string[] = [
    'propertyInfo', 
    'landlordInfo', 
    'caretakerInfo', 
    'tenantsInfo', 
    'status', 
    'actions'
  ];

  getPropertyStatusClass(status: string): string {
    const statusMap: any = {
      'occupied': 'status-occupied',
      'vacant': 'status-vacant',
      'maintenance': 'status-maintenance'
    };
    return statusMap[status] || 'status-vacant';
  }
}