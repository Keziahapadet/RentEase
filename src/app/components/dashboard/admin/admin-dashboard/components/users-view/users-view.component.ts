import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EnhancedUser } from '../../../../../../models/user.model';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './users-view.component.html',
  styleUrls: ['./users-view.component.scss']
})
export class UsersViewComponent {
  @Input() filteredUsers: EnhancedUser[] = [];
  @Input() selectedUserType: string = 'all';
  @Input() selectedStatus: string = 'all';
  
  @Output() filterUsers = new EventEmitter<void>();
  @Output() viewUserDetails = new EventEmitter<EnhancedUser>();
  @Output() editUser = new EventEmitter<EnhancedUser>();
  @Output() suspendUser = new EventEmitter<EnhancedUser>();
  @Output() activateUser = new EventEmitter<EnhancedUser>();

  displayedColumns: string[] = ['avatar', 'userInfo', 'properties', 'status', 'actions'];

  getTotalUsersCount(): number {
    return this.filteredUsers.length;
  }

  getTenantsCount(): number {
    return this.filteredUsers.filter(u => u.type === 'tenant').length;
  }

  getLandlordsCount(): number {
    return this.filteredUsers.filter(u => u.type === 'landlord').length;
  }

  getCaretakersCount(): number {
    return this.filteredUsers.filter(u => u.type === 'caretaker').length;
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'suspended': 'status-suspended'
    };
    return statusMap[status] || 'status-pending';
  }
}