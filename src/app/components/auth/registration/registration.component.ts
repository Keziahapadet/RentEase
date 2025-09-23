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
  styleUrls: ['./registration.component.scss'],
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
    console.log('RegistrationComponent initialized');
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting to dashboard');
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
    console.log('Form reset');
  }

  onRoleChange(): void {
    console.log('Role changed to:', this.formData.role);
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
    console.log('Validating form data:', {
      role: this.formData.role,
      fullName: this.formData.fullName?.length,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber,
      passwordLength: this.formData.password?.length,
      agreedToTerms: this.agreedToTerms
    });

    if (!this.formData.role) { 
      this.errorMessage = 'Role is required'; 
      console.error('Validation failed: Role missing');
      return false; 
    }
    
    if (!this.formData.fullName.trim()) { 
      this.errorMessage = 'Full name is required'; 
      console.error('Validation failed: Full name missing');
      return false; 
    }
    
    if (!this.formData.email.trim()) { 
      this.errorMessage = 'Email is required'; 
      console.error('Validation failed: Email missing');
      return false; 
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) { 
      this.errorMessage = 'Invalid email address'; 
      console.error('Validation failed: Invalid email format');
      return false; 
    }

    if (!this.formData.phoneNumber.trim()) { 
      this.errorMessage = 'Phone number is required'; 
      console.error('Validation failed: Phone number missing');
      return false; 
    }
    
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) {
      this.errorMessage = 'Invalid phone number format (use +254XXXXXXXXX or 07XXXXXXXX)'; 
      console.error('Validation failed: Invalid phone format');
      return false;
    }

    if (!this.formData.password) { 
      this.errorMessage = 'Password required'; 
      console.error('Validation failed: Password missing');
      return false; 
    }
    
    if (this.formData.password.length < 8) { 
      this.errorMessage = 'Password must be at least 8 characters'; 
      console.error('Validation failed: Password too short');
      return false; 
    }
    
    if (!this.formData.confirmPassword) { 
      this.errorMessage = 'Confirm your password'; 
      console.error('Validation failed: Password confirmation missing');
      return false; 
    }
    
    if (!this.passwordsMatch()) { 
      this.errorMessage = 'Passwords do not match'; 
      console.error('Validation failed: Passwords do not match');
      return false; 
    }

    if (!this.agreedToTerms) { 
      this.errorMessage = 'Please agree to Terms and Conditions'; 
      console.error('Validation failed: Terms not agreed');
      return false; 
    }

    if (this.formData.role === UserRole.BUSINESS && this.formData.accessCode !== 'BUSINESS2024') {
      this.errorMessage = 'Invalid business access code'; 
      console.error('Validation failed: Invalid business access code');
      return false;
    }

    console.log('Form validation passed');
    return true;
  }

  async onSubmit(): Promise<void> {
    console.log('Form submission started');
    
    if (!this.validateForm()) {
      console.error('Form validation failed, stopping submission');
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerRequest: RegisterRequest = {
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phoneNumber: this.formData.phoneNumber.replace(/\s/g, ''),
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
      role: this.formData.role as UserRole,
      accessCode: this.formData.accessCode
    };

    console.log('Sending registration request:', {
      ...registerRequest,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });

    console.log('API URL being used:', 'https://rentease-nch9.onrender.com/api/auth/signup');

    this.authService.register(registerRequest).subscribe({
      next: async (response) => {
        console.log('Registration response received:', response);
        
        if (response.success) {
          this.successMessage = response.message || 'Registration successful! Sending verification code...';
          console.log('Registration successful, attempting to send OTP');
          
          try {
            const otpRequest: OtpRequest = {
              email: this.formData.email.trim().toLowerCase(),
              type: 'email_verification'
            };
            
            console.log('Sending OTP request:', otpRequest);
            
            // Store email in session storage for OTP verification
            sessionStorage.setItem('pendingVerificationEmail', this.formData.email.trim().toLowerCase());
            
            // Navigate to OTP verification immediately
            console.log('Navigating to OTP verification');
            this.router.navigate(['/verify-otp'], {
              queryParams: {
                email: this.formData.email.trim().toLowerCase(),
                type: 'email_verification'
              }
            });

          } catch (otpError: any) {
            console.error('Failed to send OTP:', otpError);
            console.error('OTP Error details:', {
              message: otpError.message,
              status: otpError.status,
              error: otpError.error
            });
            
            // Still navigate to OTP page even if sending fails
            sessionStorage.setItem('pendingVerificationEmail', this.formData.email.trim().toLowerCase());
            this.router.navigate(['/verify-otp'], {
              queryParams: {
                email: this.formData.email.trim().toLowerCase(),
                type: 'email_verification'
              }
            });
          }
        } else {
          console.error('Registration failed - success flag is false:', response);
          this.errorMessage = response.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Registration error caught:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url
        });
        
        this.isLoading = false;
        
        // Enhanced error message handling
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid registration data. Please check your information.';
        } else if (error.status === 409) {
          this.errorMessage = 'Email address is already registered. Please use a different email or try logging in.';
        } else if (error.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
        
        console.error('Final error message:', this.errorMessage);
      },
      complete: () => {
        console.log('Registration request completed');
        this.isLoading = false;
      }
    });
  }

  navigateToLogin(): void {
    console.log('Navigating to login');
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

  getDebugInfo(): any {
    return {
      formData: {
        ...this.formData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      },
      isLoading: this.isLoading,
      errorMessage: this.errorMessage,
      successMessage: this.successMessage,
      authService: {
        isAuthenticated: this.authService.isAuthenticated(),
        hasToken: !!this.authService.getToken()
      }
    };
  }

  logDebugInfo(): void {
    console.log('Debug Info:', this.getDebugInfo());
  }
}