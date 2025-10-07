import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class RegistrationComponent implements OnInit {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

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

  ngOnInit(): void {
    console.log('RegistrationComponent initialized');
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
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.formData.password === this.formData.confirmPassword && this.formData.confirmPassword !== '';
  }

  showBusinessAccessCode(): boolean {
    return this.formData.role === UserRole.BUSINESS;
  }

  validateForm(): boolean {
    if (!this.formData.role) { this.showError('Role is required'); return false; }
    
    if (!this.formData.fullName.trim()) { this.showError('Full name is required'); return false; }
    if (!this.formData.email.trim()) { this.showError('Email is required'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) { this.showError('Invalid email address'); return false; }
    if (!this.formData.phoneNumber.trim()) { this.showError('Phone number is required'); return false; }
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) { 
      this.showError('Invalid phone number format'); return false; 
    }
    if (!this.formData.password) { this.showError('Password required'); return false; }
    if (this.formData.password.length < 8) { this.showError('Password must be at least 8 characters'); return false; }
    if (!this.passwordsMatch()) { this.showError('Passwords do not match'); return false; }
    if (!this.agreedToTerms) { this.showError('Please agree to Terms and Conditions'); return false; }

    if (this.formData.role === UserRole.BUSINESS && this.formData.accessCode !== 'BUSINESS2024') {
      this.showError('Invalid business access code'); return false;
    }
    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;

    this.isLoading = true;

    const registerRequest: RegisterRequest = {
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phoneNumber: this.formData.phoneNumber.replace(/\s/g, ''),
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
      role: this.formData.role as UserRole,
      accessCode: this.formData.accessCode
    };

    console.log('Registering user with role:', registerRequest.role);

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {

          sessionStorage.setItem('pendingVerificationEmail', registerRequest.email);
          
          this.showSuccess(response.message || 'Registration successful! Please check your email for verification code');
        
          setTimeout(() => {
            this.router.navigate(['/verify-otp'], { 
              queryParams: { 
                email: registerRequest.email,
                userType: registerRequest.role.toLowerCase(), 
                message: 'Registration successful! Please check your email for verification code.'
              }
            });
          }, 2000);
        } else {
          this.showError(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error?.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 5000, 
      horizontalPosition: 'right', 
      verticalPosition: 'top', 
      panelClass: ['snackbar-success'] 
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 5000, 
      horizontalPosition: 'right', 
      verticalPosition: 'top', 
      panelClass: ['snackbar-error'] 
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
}