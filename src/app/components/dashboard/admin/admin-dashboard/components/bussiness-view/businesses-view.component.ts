import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Business } from '../../../../../../models/bussiness.model';


@Component({
  selector: 'app-businesses-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './businesses-view.component.html',
  styleUrls: ['./businesses-view.component.scss']
})
export class BusinessesViewComponent {
  @Input() businesses: Business[] = [];
  @Input() pendingApprovals: number = 0;
  @Input() activeBusinesses: number = 0;
  
  @Output() approveBusiness = new EventEmitter<Business>();
  @Output() rejectBusiness = new EventEmitter<Business>();

  displayedColumns: string[] = [
    'name', 
    'category', 
    'status', 
    'rating', 
    'totalJobs', 
    'actions'
  ];

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  }
}