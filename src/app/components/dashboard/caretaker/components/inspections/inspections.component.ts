import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CaretakerService } from '../../../../../services/caretaker.service';

export interface Inspection {
  id: string;
  type: 'move-in' | 'move-out' | 'routine';
  property: string;
  tenantName: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  depositAmount: number;
  notes?: string;
  scheduledTime?: string;
}

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './inspections.component.html',
  styleUrls: ['./inspections.component.scss']
})
export class InspectionsComponent implements OnInit {
  inspections: Inspection[] = [];
  displayedColumns: string[] = ['type', 'property', 'tenantName', 'date', 'status', 'depositAmount', 'actions'];

  constructor(private caretakerService: CaretakerService) {}

  ngOnInit(): void {
    this.loadInspections();
  }

  loadInspections(): void {
    // For demo purposes - replace with actual service call
    this.inspections = [
      {
        id: '1',
        type: 'move-in',
        property: 'Apartment 4B',
        tenantName: 'John Doe',
        date: '2024-03-05',
        status: 'scheduled',
        depositAmount: 25000,
        scheduledTime: '10:00 AM',
        notes: 'New tenant move-in inspection'
      },
      {
        id: '2',
        type: 'move-out',
        property: 'Unit 2A',
        tenantName: 'Sarah Smith',
        date: '2024-03-06',
        status: 'scheduled',
        depositAmount: 30000,
        scheduledTime: '2:00 PM',
        notes: 'Final inspection before tenant departure'
      },
      {
        id: '3',
        type: 'routine',
        property: 'Suite 5C',
        tenantName: 'Mike Johnson',
        date: '2024-03-07',
        status: 'scheduled',
        depositAmount: 0,
        scheduledTime: '11:30 AM',
        notes: 'Quarterly routine maintenance check'
      },
      {
        id: '4',
        type: 'move-in',
        property: 'Unit 3B',
        tenantName: 'Emily Davis',
        date: '2024-03-04',
        status: 'completed',
        depositAmount: 28000,
        scheduledTime: '9:00 AM',
        notes: 'Completed - minor scratches on walls noted'
      },
      {
        id: '5',
        type: 'routine',
        property: 'Apartment 1D',
        tenantName: 'Robert Wilson',
        date: '2024-03-08',
        status: 'scheduled',
        depositAmount: 0,
        scheduledTime: '3:30 PM',
        notes: 'Bi-annual safety inspection'
      }
    ];
    
    // Uncomment for actual service call:
    // this.caretakerService.getInspections().subscribe(inspections => {
    //   this.inspections = inspections;
    // });
  }

  completeInspection(inspection: Inspection): void {
    // For demo purposes - replace with actual service call
    const updatedInspection = {
      ...inspection,
      status: 'completed' as const,
      notes: inspection.notes || 'Inspection completed by caretaker'
    };
    
    const index = this.inspections.findIndex(i => i.id === inspection.id);
    if (index !== -1) {
      this.inspections[index] = updatedInspection;
    }
    
    // Uncomment for actual service call:
    // this.caretakerService.completeInspection(inspection.id).subscribe(updatedInspection => {
    //   const index = this.inspections.findIndex(i => i.id === updatedInspection.id);
    //   if (index !== -1) {
    //     this.inspections[index] = updatedInspection;
    //   }
    // });
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  getInspectionTypeClass(type: string): string {
    const typeMap: any = {
      'move-in': 'type-move-in',
      'move-out': 'type-move-out',
      'routine': 'type-routine'
    };
    return typeMap[type] || 'type-routine';
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'scheduled': 'status-scheduled',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-scheduled';
  }
}