           export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: string;
  updatedBy: string;
  auditLog?: AuditLogEntry[];
}

export interface AuditLogEntry {
  id: string;
  entityId: string;
  entityType: string;
  action: AuditAction;
  changes: FieldChange[];
  performedBy: string;
  performedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: ChangeType;
}

export enum ChangeType {
  ADDED = 'added',
  MODIFIED = 'modified',
  REMOVED = 'removed'
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}

export interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionedEntity extends BaseEntity {
  version: number;
}

export interface StatusEntity extends BaseEntity {
  status: EntityStatus;
  statusChangedAt?: Date;
  statusChangedBy?: string;
}

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}
