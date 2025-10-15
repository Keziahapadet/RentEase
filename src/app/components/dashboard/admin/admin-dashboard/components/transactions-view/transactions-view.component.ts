import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Transaction } from '../../../../../../models/transaction.model';


@Component({
  selector: 'app-transactions-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.scss']
})
export class TransactionsViewComponent {
  @Input() transactions: Transaction[] = [];
  
  @Output() viewTransactionDetails = new EventEmitter<Transaction>();

  displayedColumns: string[] = [
    'type', 
    'business', 
    'amount', 
    'date', 
    'status', 
    'actions'
  ];

  getStatusClass(status: string): string {
    const statusMap: any = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'failed': 'status-failed'
    };
    return statusMap[status] || 'status-pending';
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  getTotalTransactions(): number {
    return this.transactions.length;
  }

  getCompletedTransactions(): number {
    return this.transactions.filter(t => t.status === 'completed').length;
  }
}