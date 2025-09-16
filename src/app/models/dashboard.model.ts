export interface DashboardStats {
  rentStatus: RentStatus;
  nextPaymentDate: Date;
  amountDue: number;
  depositAmount: number;
  unreadMessages: number;
  activeMaintenanceRequests: number;
  leaseExpiryDays: number;
  overdueAmount: number;
  totalPaidThisYear: number;
}

export enum RentStatus {
  PAID = 'paid',
  DUE = 'due',
  OVERDUE = 'overdue',
  PARTIAL = 'partial'
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
  icon: string;
  color: string;
  actionUrl?: string;
  metadata?: any;
}

export enum ActivityType {
  PAYMENT = 'payment',
  MAINTENANCE = 'maintenance',
  MESSAGE = 'message',
  DOCUMENT = 'document',
  LEASE = 'lease',
  ANNOUNCEMENT = 'announcement'
}