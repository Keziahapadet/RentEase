import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface MaintenanceRequest {
  id: string;
  title: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: string;
  status: MaintenanceStatus;
  urgencyLevel: UrgencyLevel;
  location: string;
  dateSubmitted: string;
  dateCompleted?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: ServiceProvider;
  images: MaintenanceImage[];
  updates: MaintenanceUpdate[];
  tenantRating?: number;
  tenantFeedback?: string;
  scheduledDate?: string;
}

export enum MaintenanceCategory {
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  HVAC = 'HVAC',
  APPLIANCES = 'Appliances',
  SECURITY = 'Security',
  PAINTING = 'Painting',
  FLOORING = 'Flooring',
  DOORS_WINDOWS = 'Doors & Windows',
  PEST_CONTROL = 'Pest Control',
  CLEANING = 'Cleaning',
  LANDSCAPING = 'Landscaping',
  OTHER = 'Other'
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum MaintenanceStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  PENDING_PARTS = 'pending_parts',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum UrgencyLevel {
  EMERGENCY = 'emergency',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ServiceProvider {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  specialties: MaintenanceCategory[];
  rating: number;
  verified: boolean;
}

export interface MaintenanceImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface MaintenanceUpdate {
  id: string;
  message: string;
  status: MaintenanceStatus;
  updatedBy: string;
  updatedByType: 'tenant' | 'landlord' | 'caretaker' | 'service_provider';
  updatedAt: string;
  images?: string[];
  scheduledDate?: string;
  estimatedCost?: number;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  @Output() backClick = new EventEmitter<void>();
  @Output() sectionToggle = new EventEmitter<string>();

  // Form and state
  maintenanceForm!: FormGroup;
  selectedTab: 'new' | 'active' | 'completed' | 'all' = 'new';
  isSubmitting: boolean = false;
  showImagePreview: boolean = false;
  selectedImages: File[] = [];
  filterStatus: string = '';
  filterCategory: string = '';
  sortBy: 'date' | 'priority' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Enums for template
  MaintenanceCategory = MaintenanceCategory;
  MaintenancePriority = MaintenancePriority;
  MaintenanceStatus = MaintenanceStatus;
  UrgencyLevel = UrgencyLevel;

  // Category options
  categoryOptions = Object.values(MaintenanceCategory);
  priorityOptions = Object.values(MaintenancePriority);

  // Maintenance requests data
  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      title: 'Kitchen Faucet Leaking',
      category: MaintenanceCategory.PLUMBING,
      priority: MaintenancePriority.HIGH,
      description: 'The kitchen faucet has been leaking for the past few days. Water is dripping constantly even when fully closed. The leak seems to be coming from the base of the faucet.',
      status: MaintenanceStatus.IN_PROGRESS,
      urgencyLevel: UrgencyLevel.HIGH,
      location: 'Kitchen - Main Sink',
      dateSubmitted: '2024-02-10',
      estimatedCost: 150,
      assignedTo: {
        id: '1',
        name: 'Mike Wilson',
        company: 'Quick Fix Plumbing',
        phone: '+254 700 123 456',
        email: 'mike@quickfixplumbing.co.ke',
        specialties: [MaintenanceCategory.PLUMBING],
        rating: 4.8,
        verified: true
      },
      images: [
        {
          id: '1',
          url: '/assets/images/faucet-leak.jpg',
          caption: 'Leaking faucet base',
          uploadedAt: '2024-02-10'
        }
      ],
      updates: [
        {
          id: '1',
          message: 'Request received and assigned to Mike Wilson from Quick Fix Plumbing.',
          status: MaintenanceStatus.ACKNOWLEDGED,
          updatedBy: 'Property Manager',
          updatedByType: 'landlord',
          updatedAt: '2024-02-10 10:30 AM'
        },
        {
          id: '2',
          message: 'Technician will arrive tomorrow between 9-11 AM to assess and repair.',
          status: MaintenanceStatus.SCHEDULED,
          updatedBy: 'Mike Wilson',
          updatedByType: 'service_provider',
          updatedAt: '2024-02-10 2:15 PM',
          scheduledDate: '2024-02-11'
        }
      ],
      scheduledDate: '2024-02-11'
    },
    {
      id: '2',
      title: 'Bedroom Light Not Working',
      category: MaintenanceCategory.ELECTRICAL,
      priority: MaintenancePriority.MEDIUM,
      description: 'The main bedroom ceiling light stopped working suddenly. I checked and the bulb is fine. Might be a wiring issue.',
      status: MaintenanceStatus.COMPLETED,
      urgencyLevel: UrgencyLevel.MEDIUM,
      location: 'Master Bedroom',
      dateSubmitted: '2024-01-28',
      dateCompleted: '2024-02-01',
      actualCost: 85,
      assignedTo: {
        id: '2',
        name: 'Sarah Electric',
        company: 'Power Pro Solutions',
        phone: '+254 701 234 567',
        email: 'sarah@powerpro.co.ke',
        specialties: [MaintenanceCategory.ELECTRICAL],
        rating: 4.9,
        verified: true
      },
      images: [],
      updates: [
        {
          id: '3',
          message: 'Issue resolved. Replaced faulty wall switch.',
          status: MaintenanceStatus.COMPLETED,
          updatedBy: 'Sarah Electric',
          updatedByType: 'service_provider',
          updatedAt: '2024-02-01 11:45 AM'
        }
      ],
      tenantRating: 5,
      tenantFeedback: 'Quick and professional service. Fixed the issue perfectly.'
    },
    {
      id: '3',
      title: 'Air Conditioning Not Cooling',
      category: MaintenanceCategory.HVAC,
      priority: MaintenancePriority.URGENT,
      description: 'The AC unit in the living room is running but not cooling the air. It has been like this for 2 days.',
      status: MaintenanceStatus.SUBMITTED,
      urgencyLevel: UrgencyLevel.HIGH,
      location: 'Living Room',
      dateSubmitted: '2024-02-12',
      images: [],
      updates: []
    }
  ];

  // Common maintenance issues for quick selection
  commonIssues = [
    { title: 'Leaky Faucet', category: MaintenanceCategory.PLUMBING, priority: MaintenancePriority.MEDIUM },
    { title: 'Clogged Drain', category: MaintenanceCategory.PLUMBING, priority: MaintenancePriority.MEDIUM },
    { title: 'Light Not Working', category: MaintenanceCategory.ELECTRICAL, priority: MaintenancePriority.LOW },
    { title: 'Power Outlet Not Working', category: MaintenanceCategory.ELECTRICAL, priority: MaintenancePriority.MEDIUM },
    { title: 'AC Not Working', category: MaintenanceCategory.HVAC, priority: MaintenancePriority.HIGH },
    { title: 'Heating Not Working', category: MaintenanceCategory.HVAC, priority: MaintenancePriority.HIGH },
    { title: 'Door Lock Issues', category: MaintenanceCategory.SECURITY, priority: MaintenancePriority.HIGH },
    { title: 'Window Won\'t Close', category: MaintenanceCategory.DOORS_WINDOWS, priority: MaintenancePriority.MEDIUM }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  private initializeForm(): void {
    this.maintenanceForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      priority: [MaintenancePriority.MEDIUM, Validators.required],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgencyLevel: [UrgencyLevel.MEDIUM]
    });
  }

  // Navigation
  goBack(): void {
    this.backClick.emit();
  }

  setActiveTab(tab: 'new' | 'active' | 'completed' | 'all'): void {
    this.selectedTab = tab;
  }

  // Section management
  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections?.has(sectionId) || false;
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections?.has(sectionId) || false;
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
  }

  // Form methods
  selectCommonIssue(issue: any): void {
    this.maintenanceForm.patchValue({
      title: issue.title,
      category: issue.category,
      priority: issue.priority
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedImages = Array.from(input.files);
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  submitMaintenanceRequest(): void {
    if (this.maintenanceForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.maintenanceForm.value;
      const newRequest: MaintenanceRequest = {
        id: Date.now().toString(),
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        status: MaintenanceStatus.SUBMITTED,
        urgencyLevel: formData.urgencyLevel,
        location: formData.location,
        dateSubmitted: new Date().toISOString().split('T')[0],
        images: this.selectedImages.map((file, index) => ({
          id: `${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          caption: file.name,
          uploadedAt: new Date().toISOString()
        })),
        updates: []
      };

      // Simulate API call
      setTimeout(() => {
        this.maintenanceRequests.unshift(newRequest);
        this.resetForm();
        this.isSubmitting = false;
        this.setActiveTab('all');
        console.log('Maintenance request submitted:', newRequest);
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.maintenanceForm.controls).forEach(key => {
      this.maintenanceForm.get(key)?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.maintenanceForm.reset({
      priority: MaintenancePriority.MEDIUM,
      urgencyLevel: UrgencyLevel.MEDIUM
    });
    this.selectedImages = [];
  }

  // Request management
  get filteredRequests(): MaintenanceRequest[] {
    let filtered = [...this.maintenanceRequests];

    // Filter by tab
    switch (this.selectedTab) {
      case 'active':
        filtered = filtered.filter(req => 
          [MaintenanceStatus.SUBMITTED, MaintenanceStatus.ACKNOWLEDGED, 
           MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.SCHEDULED,
           MaintenanceStatus.PENDING_PARTS].includes(req.status)
        );
        break;
      case 'completed':
        filtered = filtered.filter(req => req.status === MaintenanceStatus.COMPLETED);
        break;
      case 'all':
        // No additional filtering
        break;
    }

    // Apply additional filters
    if (this.filterStatus) {
      filtered = filtered.filter(req => req.status === this.filterStatus);
    }

    if (this.filterCategory) {
      filtered = filtered.filter(req => req.category === this.filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'date':
          aValue = new Date(a.dateSubmitted);
          bValue = new Date(b.dateSubmitted);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  setSortBy(sortBy: 'date' | 'priority' | 'status'): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterCategory = '';
  }

  // Request actions
  cancelRequest(request: MaintenanceRequest): void {
    if (confirm(`Are you sure you want to cancel "${request.title}"?`)) {
      request.status = MaintenanceStatus.CANCELLED;
      request.updates.push({
        id: Date.now().toString(),
        message: 'Request cancelled by tenant',
        status: MaintenanceStatus.CANCELLED,
        updatedBy: 'You',
        updatedByType: 'tenant',
        updatedAt: new Date().toLocaleString()
      });
    }
  }

  rateService(request: MaintenanceRequest, rating: number): void {
    request.tenantRating = rating;
    console.log(`Rated request ${request.id} with ${rating} stars`);
  }

  submitFeedback(request: MaintenanceRequest, feedback: string): void {
    request.tenantFeedback = feedback;
    console.log(`Feedback submitted for request ${request.id}`);
  }

  // Utility methods
  getStatusClass(status: MaintenanceStatus): string {
    const statusMap = {
      [MaintenanceStatus.SUBMITTED]: 'status-info',
      [MaintenanceStatus.ACKNOWLEDGED]: 'status-info',
      [MaintenanceStatus.IN_PROGRESS]: 'status-warning',
      [MaintenanceStatus.SCHEDULED]: 'status-warning',
      [MaintenanceStatus.PENDING_PARTS]: 'status-warning',
      [MaintenanceStatus.COMPLETED]: 'status-success',
      [MaintenanceStatus.CANCELLED]: 'status-danger',
      [MaintenanceStatus.REJECTED]: 'status-danger'
    };
    return statusMap[status] || 'status-default';
  }

  getPriorityClass(priority: MaintenancePriority): string {
    const priorityMap = {
      [MaintenancePriority.LOW]: 'priority-low',
      [MaintenancePriority.MEDIUM]: 'priority-medium',
      [MaintenancePriority.HIGH]: 'priority-high',
      [MaintenancePriority.URGENT]: 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-default';
  }

  getUrgencyClass(urgency: UrgencyLevel): string {
    const urgencyMap = {
      [UrgencyLevel.LOW]: 'urgency-low',
      [UrgencyLevel.MEDIUM]: 'urgency-medium',
      [UrgencyLevel.HIGH]: 'urgency-high',
      [UrgencyLevel.EMERGENCY]: 'urgency-emergency'
    };
    return urgencyMap[urgency] || 'urgency-default';
  }

  getStatusIcon(status: MaintenanceStatus): string {
    const iconMap = {
      [MaintenanceStatus.SUBMITTED]: 'hourglass_empty',
      [MaintenanceStatus.ACKNOWLEDGED]: 'schedule',
      [MaintenanceStatus.IN_PROGRESS]: 'build',
      [MaintenanceStatus.SCHEDULED]: 'event',
      [MaintenanceStatus.PENDING_PARTS]: 'inventory',
      [MaintenanceStatus.COMPLETED]: 'check_circle',
      [MaintenanceStatus.CANCELLED]: 'cancel',
      [MaintenanceStatus.REJECTED]: 'error'
    };
    return iconMap[status] || 'help';
  }

  getCategoryIcon(category: MaintenanceCategory): string {
    const iconMap = {
      [MaintenanceCategory.PLUMBING]: 'plumbing',
      [MaintenanceCategory.ELECTRICAL]: 'electrical_services',
      [MaintenanceCategory.HVAC]: 'ac_unit',
      [MaintenanceCategory.APPLIANCES]: 'kitchen',
      [MaintenanceCategory.SECURITY]: 'security',
      [MaintenanceCategory.PAINTING]: 'palette',
      [MaintenanceCategory.FLOORING]: 'home',
      [MaintenanceCategory.DOORS_WINDOWS]: 'door_front',
      [MaintenanceCategory.PEST_CONTROL]: 'pest_control',
      [MaintenanceCategory.CLEANING]: 'cleaning_services',
      [MaintenanceCategory.LANDSCAPING]: 'grass',
      [MaintenanceCategory.OTHER]: 'handyman'
    };
    return iconMap[category] || 'build';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRequestSummaryStats() {
    const total = this.maintenanceRequests.length;
    const active = this.maintenanceRequests.filter(req => 
      [MaintenanceStatus.SUBMITTED, MaintenanceStatus.ACKNOWLEDGED, 
       MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.SCHEDULED].includes(req.status)
    ).length;
    const completed = this.maintenanceRequests.filter(req => 
      req.status === MaintenanceStatus.COMPLETED
    ).length;
    const urgent = this.maintenanceRequests.filter(req => 
      req.priority === MaintenancePriority.URGENT
    ).length;

    return { total, active, completed, urgent };
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.maintenanceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.maintenanceForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['email']) return `Invalid email format`;
    }
    return '';
  }

  // Accessibility
  getAriaLabel(sectionId: string): string {
    const collapsed = this.isSectionCollapsed(sectionId);
    return `${collapsed ? 'Expand' : 'Collapse'} ${sectionId} section`;
  }

  // Track by functions for performance
  trackByRequestId(index: number, request: MaintenanceRequest): string {
    return request.id;
  }

  trackByUpdateId(index: number, update: MaintenanceUpdate): string {
    return update.id;
  }

  trackByImageId(index: number, image: MaintenanceImage): string {
    return image.id;
  }
}