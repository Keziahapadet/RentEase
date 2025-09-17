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
import { 
  RegisterRequest, 
  UserRole, 
  OtpRequest, 
  OtpResponse 
} from '../../../services/auth-interfaces';

interface FormData {
  role: string;
  fullName: string;       
  email: string;
  phoneNumber: string;    
  password: string;
  confirmPassword: string;
  accessCode?: string;
}

interface TimelineEvent {
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

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

  availableRoles = [
    { value: UserRole.TENANT, label: 'Tenant' },
    { value: UserRole.LANDLORD, label: 'Landlord' },
    { value: UserRole.CARETAKER, label: 'Caretaker' },
    { value: UserRole.BUSINESS, label: 'Business' }
  ];

  showPassword = false;
  showConfirmPassword = false;
  agreedToTerms = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Dashboard demo functionality
  activeSection = 'dashboard';
  depositAmount = 50000;

  depositTimeline: TimelineEvent[] = [
    { title: 'Application Submitted', date: '2024-01-15', description: 'Application submitted successfully.', completed: true },
    { title: 'Background Check', date: '2024-01-16', description: 'Background verification in progress.', completed: true },
    { title: 'Deposit Payment', date: '2024-01-18', description: 'Security deposit payment pending.', completed: false },
    { title: 'Lease Agreement', date: '2024-01-20', description: 'Lease signing upcoming.', completed: false }
  ];

  newMaintenanceRequest: MaintenanceRequest = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  };

  ngOnInit(): void {
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
    if (this.formData.role !== UserRole.BUSINESS) {
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

    if (!this.formData.role) { this.errorMessage = 'Role is required'; return false; }
    if (!this.formData.fullName.trim()) { this.errorMessage = 'Full name is required'; return false; }
    if (!this.formData.email.trim()) { this.errorMessage = 'Email is required'; return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) { this.errorMessage = 'Invalid email address'; return false; }

    if (!this.formData.phoneNumber.trim()) { this.errorMessage = 'Phone number is required'; return false; }
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) {
      this.errorMessage = 'Invalid phone number format'; 
      return false;
    }

    if (!this.formData.password) { this.errorMessage = 'Password required'; return false; }
    if (this.formData.password.length < 8) { this.errorMessage = 'Password must be at least 8 characters'; return false; }
    if (!this.formData.confirmPassword) { this.errorMessage = 'Confirm your password'; return false; }
    if (!this.passwordsMatch()) { this.errorMessage = 'Passwords do not match'; return false; }

    if (!this.agreedToTerms) { this.errorMessage = 'Please agree to Terms and Conditions'; return false; }

    if (this.formData.role === UserRole.BUSINESS && this.formData.accessCode !== 'BUSINESS2024') {
      this.errorMessage = 'Invalid business access code'; 
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

    console.log('Registering user with role:', this.formData.role);

    this.authService.register(registerRequest).subscribe({
      next: async (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Registration successful! Sending verification code...';
          
          try {
            const otpResponse: OtpResponse | undefined = await this.authService.sendOtp({
              email: this.formData.email.trim().toLowerCase(),
              type: 'email_verification'
            } as OtpRequest).toPromise();

            if (otpResponse?.success) {
              this.successMessage = 'Registration successful! Verification code sent to your email.';
            }

            setTimeout(() => {
              this.router.navigate(['/verify-otp'], {
                queryParams: {
                  email: this.formData.email.trim().toLowerCase(),
                  type: 'email_verification'
                }
              });
            }, 1500);

          } catch (otpError: any) {
            console.error('Failed to send OTP:', otpError);
            this.successMessage = 'Registration successful! Redirecting to verification...';
            setTimeout(() => {
              this.router.navigate(['/verify-otp'], {
                queryParams: {
                  email: this.formData.email.trim().toLowerCase(),
                  type: 'email_verification'
                }
              });
            }, 1500);
          }
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
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

  showBusinessAccessCode(): boolean {
    return this.formData.role === UserRole.BUSINESS;
  }

  showAdminAccessCode(): boolean {
    return this.showBusinessAccessCode();
  }

  isTenantSelected(): boolean { return this.formData.role === UserRole.TENANT; }
  isLandlordSelected(): boolean { return this.formData.role === UserRole.LANDLORD; }
  isCaretakerSelected(): boolean { return this.formData.role === UserRole.CARETAKER; }
  isBusinessSelected(): boolean { return this.formData.role === UserRole.BUSINESS; }

  getRoleWelcomeMessage(): string {
    switch (this.formData.role) {
      case UserRole.TENANT: return 'Join as a tenant to find your perfect rental home';
      case UserRole.LANDLORD: return 'Join as a landlord to manage your properties';
      case UserRole.CARETAKER: return 'Join as a caretaker to maintain properties';
      case UserRole.BUSINESS: return 'Join as a business to access advanced features';
      default: return 'Select your role to get started';
    }
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-KE').format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  submitMaintenanceRequest(): void {
    if (!this.newMaintenanceRequest.title.trim()) {
      this.errorMessage = 'Maintenance request title is required';
      return;
    }
    if (!this.newMaintenanceRequest.description.trim()) {
      this.errorMessage = 'Maintenance request description is required';
      return;
    }

    console.log('Submitting maintenance request:', this.newMaintenanceRequest);
    this.successMessage = 'Maintenance request submitted successfully!';
    this.resetMaintenanceForm();
    
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }

  private resetMaintenanceForm(): void {
    this.newMaintenanceRequest = { title: '', description: '', priority: 'medium', category: 'general' };
  }

  getCompletedTimelineCount(): number {
    return this.depositTimeline.filter(event => event.completed).length;
  }

  getTotalTimelineCount(): number {
    return this.depositTimeline.length;
  }

  getTimelineCompletionPercentage(): number {
    if (this.depositTimeline.length === 0) return 0;
    return (this.getCompletedTimelineCount() / this.getTotalTimelineCount()) * 100;
  }

  getDepositStatusText(): string {
    const completedCount = this.getCompletedTimelineCount();
    const totalCount = this.getTotalTimelineCount();
    if (completedCount === totalCount) return 'Completed';
    else if (completedCount > 0) return 'In Progress';
    else return 'Pending';
  }

  hasRecentActivities(): boolean {
    return true;
  }

  getRecentActivitiesCount(): number {
    return 3;
  }

  trackByActivityId(index: number, item: TimelineEvent): string {
    return `${item.title}-${item.date}`;
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'payment': return 'payment';
      case 'maintenance': return 'maintenance';
      case 'document': return 'document';
      case 'message': return 'message';
      default: return 'general';
    }
  }

  refreshData(): void {
    console.log('Refreshing data...');
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
