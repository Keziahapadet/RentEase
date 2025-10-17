import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CaretakerService } from '../../../../../services/caretaker.service';

export interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'in-progress' | 'completed' | 'cancelled';
  tenantName: string;
  property: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  maintenanceRequests: MaintenanceRequest[] = [];
  displayedColumns: string[] = ['title', 'category', 'priority', 'status', 'tenantName', 'property', 'actions'];
  
  stats = {
    pendingMaintenance: 0,
    total: 0
  };

  constructor(private caretakerService: CaretakerService) {}

  ngOnInit(): void {
    this.loadMaintenanceRequests();
  }

  loadMaintenanceRequests(): void {
    // For demo purposes - replace with actual service call
    this.maintenanceRequests = [
      {
        id: '1',
        title: 'Leaking Kitchen Faucet',
        category: 'Plumbing',
        priority: 'medium',
        status: 'submitted',
        tenantName: 'John Doe',
        property: 'Apartment 4B',
        description: 'Kitchen faucet has constant drip, wasting water',
        createdAt: '2024-03-01T10:00:00',
        updatedAt: '2024-03-01T10:00:00'
      },
      {
        id: '2',
        title: 'Broken AC Unit',
        category: 'HVAC',
        priority: 'high',
        status: 'in-progress',
        tenantName: 'Sarah Smith',
        property: 'Unit 2A',
        description: 'AC not cooling properly, blowing warm air',
        createdAt: '2024-02-28T14:30:00',
        updatedAt: '2024-03-02T09:15:00'
      },
      {
        id: '3',
        title: 'Clogged Bathroom Drain',
        category: 'Plumbing',
        priority: 'urgent',
        status: 'submitted',
        tenantName: 'Mike Johnson',
        property: 'Suite 5C',
        description: 'Bathroom sink draining very slowly, almost completely blocked',
        createdAt: '2024-03-02T08:45:00',
        updatedAt: '2024-03-02T08:45:00'
      },
      {
        id: '4',
        title: 'Paint Touch-up',
        category: 'Cosmetic',
        priority: 'low',
        status: 'completed',
        tenantName: 'Emily Davis',
        property: 'Unit 3B',
        description: 'Wall scratches in living room need paint touch-up',
        createdAt: '2024-02-25T11:20:00',
        updatedAt: '2024-03-01T16:45:00'
      },
      {
        id: '5',
        title: 'Broken Window Lock',
        category: 'Security',
        priority: 'medium',
        status: 'submitted',
        tenantName: 'Robert Wilson',
        property: 'Apartment 1D',
        description: 'Bedroom window lock broken, cannot secure window',
        createdAt: '2024-03-02T13:15:00',
        updatedAt: '2024-03-02T13:15:00'
      }
    ];
    this.updateStats();
    
    // Uncomment for actual service call:
    // this.caretakerService.getMaintenanceRequests().subscribe(requests => {
    //   this.maintenanceRequests = requests;
    //   this.updateStats();
    // });
  }

  updateStats(): void {
    this.stats.pendingMaintenance = this.maintenanceRequests.filter(r => 
      r.status === 'submitted' || r.status === 'in-progress'
    ).length;
    this.stats.total = this.maintenanceRequests.length;
  }

  updateMaintenanceStatus(request: MaintenanceRequest, status: string): void {
    // For demo purposes - replace with actual service call
    const updatedRequest = {
      ...request,
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    
    const index = this.maintenanceRequests.findIndex(r => r.id === request.id);
    if (index !== -1) {
      this.maintenanceRequests[index] = updatedRequest;
      this.updateStats();
    }
    
    // Uncomment for actual service call:
    // this.caretakerService.updateMaintenanceStatus(request.id, status).subscribe(updatedRequest => {
    //   const index = this.maintenanceRequests.findIndex(r => r.id === updatedRequest.id);
    //   if (index !== -1) {
    //     this.maintenanceRequests[index] = updatedRequest;
    //     this.updateStats();
    //   }
    // });
  }

  getPriorityClass(priority: string): string {
    const priorityMap: any = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-medium';
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'submitted': 'status-pending',
      'in-progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  }
}