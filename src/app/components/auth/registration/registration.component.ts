// src/app/components/registration/registration.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest, UserRole } from '../../../services/auth-interfaces';

interface FormData {
  role: string;
  fullName: string;       
  email: string;
  phoneNumber: string;    
  password: string;
  confirmPassword: string;
  accessCode?: string;
}

// Interface for timeline events
interface TimelineEvent {
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

// Interface for maintenance requests
interface MaintenanceRequest {
  title: string;
  description: string;
  priority: string;
  category: string;
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class RegistrationComponent implements OnInit {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  formData: FormData = {
    role: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  };

  // Available roles for registration
  availableRoles = [
    { value: UserRole.TENANT, label: 'Tenant' },
    { value: UserRole.LANDLORD, label: 'Landlord' },
    { value: UserRole.PROPERTY_MANAGER, label: 'Property Manager' },
    { value: UserRole.ADMIN, label: 'Administrator' }
  ];

  showPassword = false;
  showConfirmPassword = false;
  agreedToTerms = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // ADD THESE MISSING PROPERTIES FOR DASHBOARD FUNCTIONALITY
  activeSection = 'dashboard';
  depositAmount = 50000; // Example deposit amount in KES
  
  // Deposit timeline for tracking progress
  depositTimeline: TimelineEvent[] = [
    {
      title: 'Application Submitted',
      date: '2024-01-15',
      description: 'Your rental application has been submitted successfully.',
      completed: true
    },
    {
      title: 'Background Check',
      date: '2024-01-16',
      description: 'Background verification in progress.',
      completed: true
    },
    {
      title: 'Deposit Payment',
      date: '2024-01-18',
      description: 'Security deposit payment confirmed.',
      completed: false
    },
    {
      title: 'Lease Agreement',
      date: '2024-01-20',
      description: 'Digital lease agreement signing.',
      completed: false
    }
  ];

  // Maintenance request object
  newMaintenanceRequest: MaintenanceRequest = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  };

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      role: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    };
    this.agreedToTerms = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  onRoleChange(): void {
    if (this.formData.role !== UserRole.ADMIN) {
      delete this.formData.accessCode;
    }
    this.errorMessage = '';
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return (
      this.formData.password === this.formData.confirmPassword &&
      this.formData.confirmPassword !== ''
    );
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.formData.role) { 
      this.errorMessage = 'Role is required'; 
      return false; 
    }
    
    if (!this.formData.fullName.trim()) { 
      this.errorMessage = 'Full name is required'; 
      return false; 
    }
    
    if (!this.formData.email.trim()) { 
      this.errorMessage = 'Email is required'; 
      return false; 
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) { 
      this.errorMessage = 'Invalid email address'; 
      return false; 
    }

    if (!this.formData.phoneNumber.trim()) { 
      this.errorMessage = 'Phone number is required'; 
      return false; 
    }
    
    // Updated phone regex for more flexible validation
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) {
      this.errorMessage = 'Invalid phone number format'; 
      return false;
    }

    if (!this.formData.password) { 
      this.errorMessage = 'Password required'; 
      return false; 
    }
    
    if (this.formData.password.length < 8) { 
      this.errorMessage = 'Password must be at least 8 characters'; 
      return false; 
    }
    
    if (!this.formData.confirmPassword) { 
      this.errorMessage = 'Confirm your password'; 
      return false; 
    }
    
    if (!this.passwordsMatch()) { 
      this.errorMessage = 'Passwords do not match'; 
      return false; 
    }

    if (!this.agreedToTerms) { 
      this.errorMessage = 'Please agree to Terms and Conditions'; 
      return false; 
    }
    
    // Validate admin access code
    if (this.formData.role === UserRole.ADMIN && this.formData.accessCode !== 'ADMIN2024') {
      this.errorMessage = 'Invalid admin access code'; 
      return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerRequest: RegisterRequest = {
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phoneNumber: this.formData.phoneNumber.replace(/\s/g, ''),
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
      role: this.formData.role,
      accessCode: this.formData.accessCode
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Registration successful!';
        
        // Redirect based on role
        setTimeout(() => {
          if (this.formData.role === UserRole.ADMIN) {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToTerms(): void {
    window.open('/terms', '_blank');
  }

  navigateToPrivacy(): void {
    window.open('/privacy', '_blank');
  }

  // Helper method to check if admin access code field should be shown
  showAdminAccessCode(): boolean {
    return this.formData.role === UserRole.ADMIN;
  }

  // ADD THESE MISSING METHODS TO RESOLVE TEMPLATE ERRORS

  /**
   * Format number with Kenyan locale
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-KE').format(num);
  }

  /**
   * Format currency in Kenyan Shillings
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  /**
   * Set active section for navigation
   */
  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  /**
   * Submit maintenance request
   */
  submitMaintenanceRequest(): void {
    if (!this.newMaintenanceRequest.title.trim()) {
      this.errorMessage = 'Maintenance request title is required';
      return;
    }

    if (!this.newMaintenanceRequest.description.trim()) {
      this.errorMessage = 'Maintenance request description is required';
      return;
    }

    // Here you would typically call a maintenance service
    console.log('Submitting maintenance request:', this.newMaintenanceRequest);
    
    // For now, just show success message and reset form
    this.successMessage = 'Maintenance request submitted successfully!';
    this.resetMaintenanceForm();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Reset maintenance request form
   */
  private resetMaintenanceForm(): void {
    this.newMaintenanceRequest = {
      title: '',
      description: '',
      priority: 'medium',
      category: 'general'
    };
  }

  /**
   * Get count of completed timeline events
   */
  getCompletedTimelineCount(): number {
    return this.depositTimeline.filter(event => event.completed).length;
  }

  /**
   * Get total timeline events count
   */
  getTotalTimelineCount(): number {
    return this.depositTimeline.length;
  }

  /**
   * Get timeline completion percentage
   */
  getTimelineCompletionPercentage(): number {
    if (this.depositTimeline.length === 0) return 0;
    return (this.getCompletedTimelineCount() / this.getTotalTimelineCount()) * 100;
  }

  /**
   * Get deposit status text
   */
  getDepositStatusText(): string {
    const completedCount = this.getCompletedTimelineCount();
    const totalCount = this.getTotalTimelineCount();
    
    if (completedCount === totalCount) {
      return 'Completed';
    } else if (completedCount > 0) {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  }

  /**
   * Check if user has recent activities
   */
  hasRecentActivities(): boolean {
    // This would typically check a real activities array
    return true; // For demo purposes
  }

  /**
   * Get recent activities count
   */
  getRecentActivitiesCount(): number {
    // This would return actual count from activities service
    return 3; // For demo purposes
  }

  /**
   * Track by function for timeline events
   */
  trackByActivityId(index: number, item: TimelineEvent): string {
    return `${item.title}-${item.date}`;
  }

  /**
   * Get activity icon class based on type
   */
  getActivityIconClass(type: string): string {
    switch (type) {
      case 'payment':
        return 'payment';
      case 'maintenance':
        return 'maintenance';
      case 'document':
        return 'document';
      case 'message':
        return 'message';
      default:
        return 'general';
    }
  }

  /**
   * Refresh data (placeholder for actual implementation)
   */
  refreshData(): void {
    console.log('Refreshing data...');
    // This would typically reload data from services
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}