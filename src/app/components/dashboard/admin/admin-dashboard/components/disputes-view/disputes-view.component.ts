import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Dispute } from '../../../../../../models/transaction.model';


@Component({
  selector: 'app-disputes-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './disputes-view.component.html',
  styleUrls: ['./disputes-view.component.scss']
})
export class DisputesViewComponent {
  @Input() disputes: Dispute[] = [];
  @Input() activeDisputes: number = 0;
  
  @Output() resolveDispute = new EventEmitter<Dispute>();

  displayedColumns: string[] = [
    'type', 
    'parties', 
    'amount', 
    'status', 
    'createdDate', 
    'actions'
  ];

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'resolved': 'status-resolved',
      'escalated': 'status-escalated'
    };
    return statusMap[status] || 'status-pending';
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }
}