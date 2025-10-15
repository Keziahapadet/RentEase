import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'submitted' | 'in-progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  tenantName: string;
  property: string;
}

interface Inspection {
  id: string;
  type: 'move-in' | 'move-out' | 'routine';
  property: string;
  tenantName: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  depositAmount: number;
}

interface DepositCase {
  id: string;
  tenantName: string;
  property: string;
  depositAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  inspectionDate: string;
  damageAmount: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-caretaker-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressBarModule
  ],
  templateUrl: './caretaker-dashboard.component.html',
  styleUrls: ['./caretaker-dashboard.component.scss']
})
export class CaretakerDashboardComponent implements OnInit {
  currentView: string = 'overview';
  isSidebarOpen = true;
  
  stats = {
    pendingMaintenance: 8,
    scheduledInspections: 3,
    activeDepositCases: 5,
    completedJobs: 45,
    responseRate: 92,
    tenantSatisfaction: 4.5
  };

  maintenanceRequests: MaintenanceRequest[] = [
    { id: '1', title: 'Kitchen faucet leaking', category: 'Plumbing', priority: 'medium', description: 'Kitchen sink faucet has constant drip', status: 'submitted', dateSubmitted: '2024-03-01', tenantName: 'John Doe', property: 'Apartment 4B' },
    { id: '2', title: 'Broken window lock', category: 'General Repairs', priority: 'low', description: 'Bedroom window lock not closing properly', status: 'in-progress', dateSubmitted: '2024-02-28', tenantName: 'Sarah Smith', property: 'House 12' },
    { id: '3', title: 'AC not cooling', category: 'HVAC', priority: 'high', description: 'Air conditioning not cooling living room', status: 'submitted', dateSubmitted: '2024-03-02', tenantName: 'Mike Johnson', property: 'Apartment 7C' },
    { id: '4', title: 'Electrical outlet sparking', category: 'Electrical', priority: 'urgent', description: 'Kitchen outlet sparks when plugging appliances', status: 'in-progress', dateSubmitted: '2024-03-02', tenantName: 'Alice Brown', property: 'House 8' }
  ];

  inspections: Inspection[] = [
    { id: '1', type: 'move-out', property: 'Apartment 3A', tenantName: 'David Wilson', date: '2024-03-05', status: 'scheduled', depositAmount: 50000 },
    { id: '2', type: 'move-in', property: 'House 15', tenantName: 'Emma Davis', date: '2024-03-06', status: 'scheduled', depositAmount: 75000 },
    { id: '3', type: 'routine', property: 'Apartment 2B', tenantName: 'James Miller', date: '2024-03-10', status: 'scheduled', depositAmount: 0 }
  ];

  depositCases: DepositCase[] = [
    { id: '1', tenantName: 'Robert Taylor', property: 'Apartment 5C', depositAmount: 60000, status: 'pending', inspectionDate: '2024-02-28', damageAmount: 5000 },
    { id: '2', tenantName: 'Lisa Anderson', property: 'House 9', depositAmount: 80000, status: 'approved', inspectionDate: '2024-02-25', damageAmount: 0 },
    { id: '3', tenantName: 'Thomas Moore', property: 'Apartment 1A', depositAmount: 45000, status: 'pending', inspectionDate: '2024-03-01', damageAmount: 12000 }
  ];

  quickActions: QuickAction[] = [
    { id: 'newMaintenance', title: 'New Maintenance', description: 'Create maintenance request', icon: 'build', color: '#007bff', action: () => this.createMaintenance() },
    { id: 'scheduleInspection', title: 'Schedule Inspection', description: 'Schedule property inspection', icon: 'calendar_today', color: '#28a745', action: () => this.scheduleInspection() },
    { id: 'processDeposit', title: 'Process Deposit', description: 'Handle deposit release', icon: 'account_balance', color: '#ffc107', action: () => this.processDeposit() },
    { id: 'contactTenant', title: 'Contact Tenant', description: 'Message tenant', icon: 'message', color: '#17a2b8', action: () => this.contactTenant() }
  ];

  navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'maintenance', label: 'Maintenance', icon: 'build' },
    { id: 'inspections', label: 'Inspections', icon: 'home' },
    { id: 'deposits', label: 'Deposits', icon: 'account_balance' },
    { id: 'properties', label: 'Properties', icon: 'apartment' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'reports', label: 'Reports', icon: 'assessment' }
  ];

  displayedMaintenanceColumns: string[] = ['title', 'category', 'priority', 'status', 'tenantName', 'property', 'actions'];
  displayedInspectionColumns: string[] = ['type', 'property', 'tenantName', 'date', 'status', 'depositAmount', 'actions'];
  displayedDepositColumns: string[] = ['tenantName', 'property', 'depositAmount', 'status', 'damageAmount', 'actions'];

  ngOnInit(): void {
    this.loadCaretakerData();
  }

  loadCaretakerData(): void {
    console.log('Loading caretaker data...');
  }

  setView(view: string): void {
    this.currentView = view;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  createMaintenance(): void {
    console.log('Creating new maintenance request...');
  }

  scheduleInspection(): void {
    console.log('Scheduling inspection...');
  }

  processDeposit(): void {
    console.log('Processing deposit...');
  }

  contactTenant(): void {
    console.log('Contacting tenant...');
  }

  updateMaintenanceStatus(request: MaintenanceRequest, status: string): void {
    request.status = status as any;
  }

  completeInspection(inspection: Inspection): void {
    inspection.status = 'completed';
  }

  approveDeposit(deposit: DepositCase): void {
    deposit.status = 'approved';
  }

  rejectDeposit(deposit: DepositCase): void {
    deposit.status = 'rejected';
  }

  formatCurrency(amount: number): string {
    return `KSH ${amount.toLocaleString('en-KE')}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-KE');
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'submitted': 'status-pending',
      'in-progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'scheduled': 'status-scheduled',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
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

  getInspectionTypeClass(type: string): string {
    const typeMap: any = {
      'move-in': 'type-move-in',
      'move-out': 'type-move-out',
      'routine': 'type-routine'
    };
    return typeMap[type] || 'type-routine';
  }

  refreshData(): void {
    this.loadCaretakerData();
  }

  logout(): void {
    console.log('Caretaker logging out...');
  }

  getPendingDepositCount(): number {
    return this.depositCases.filter((d: DepositCase) => d.status === 'pending').length;
  }
}