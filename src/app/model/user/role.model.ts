     
import { UserRole } from '../../shared/enums/user-role.enum';

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  isDefault: boolean;
  hierarchy: number; // Lower numbers = higher priority
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
  isActive: boolean;
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXECUTE = 'execute'
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: any;
}

export interface RoleCapabilities {
  canManageProperties: boolean;
  canManageTenants: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canAccessReports: boolean;
  canModifySettings: boolean;
  canCreateBookings: boolean;
  canApproveRequests: boolean;
  maxProperties?: number;
  maxTenants?: number;
}

export interface RoleHierarchy {
  role: UserRole;
  level: number;
  canManage: UserRole[];
  reportingTo?: UserRole;
  subordinates: UserRole[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleCapabilities> = {
  [UserRole.ADMIN]: {
    canManageProperties: true,
    canManageTenants: true,
    canViewFinancials: true,
    canManageUsers: true,
    canAccessReports: true,
    canModifySettings: true,
    canCreateBookings: true,
    canApproveRequests: true
  },
  [UserRole.LANDLORD]: {
    canManageProperties: true,
    canManageTenants: true,
    canViewFinancials: true,
    canManageUsers: false,
    canAccessReports: true,
    canModifySettings: false,
    canCreateBookings: false,
    canApproveRequests: true
  },
  [UserRole.CARETAKER]: {
    canManageProperties: false,
    canManageTenants: true,
    canViewFinancials: false,
    canManageUsers: false,
    canAccessReports: false,
    canModifySettings: false,
    canCreateBookings: false,
    canApproveRequests: false
  },
  [UserRole.BUSINESS]: {
    canManageProperties: true,
    canManageTenants: true,
    canViewFinancials: true,
    canManageUsers: true,
    canAccessReports: true,
    canModifySettings: true,
    canCreateBookings: true,
    canApproveRequests: true
  },
  [UserRole.TENANT]: {
    canManageProperties: false,
    canManageTenants: false,
    canViewFinancials: false,
    canManageUsers: false,
    canAccessReports: false,
    canModifySettings: false,
    canCreateBookings: true,
    canApproveRequests: false
  }
};

export interface RoleChangeRequest {
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  reason: string;
  requestedBy: string;
  requestedAt: Date;
  status: RoleChangeStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export enum RoleChangeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}