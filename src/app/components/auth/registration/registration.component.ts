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


  fieldErrors = {
    role: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accessCode: ''
  };

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
    this.clearAllErrors();
  }

  clearAllErrors(): void {
    Object.keys(this.fieldErrors).forEach(key => {
      this.fieldErrors[key as keyof typeof this.fieldErrors] = '';
    });
  }

  clearFieldError(field: keyof typeof this.fieldErrors): void {
    this.fieldErrors[field] = '';
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
    this.clearAllErrors();
    let isValid = true;

  
    if (!this.formData.role) {
      this.fieldErrors.role = 'Please select a role';
      this.showError('Please select a role');
      return false;
    }

   
    if (!this.formData.fullName.trim()) {
      this.fieldErrors.fullName = 'Full name is required';
      this.showError('Full name is required');
      return false;
    }
    if (this.formData.fullName.trim().length < 3) {
      this.fieldErrors.fullName = 'Full name must be at least 3 characters';
      this.showError('Full name must be at least 3 characters');
      return false;
    }

   
    if (!this.formData.email.trim()) {
      this.fieldErrors.email = 'Email is required';
      this.showError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.fieldErrors.email = 'Invalid email format';
      this.showError('Please enter a valid email address');
      return false;
    }

 
    if (!this.formData.phoneNumber.trim()) {
      this.fieldErrors.phoneNumber = 'Phone number is required';
      this.showError('Phone number is required');
      return false;
    }
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) {
      this.fieldErrors.phoneNumber = 'Invalid phone number format';
      this.showError('Invalid phone number format. Use format: +254712345678 or 0712345678');
      return false;
    }

    
    if (!this.formData.password) {
      this.fieldErrors.password = 'Password is required';
      this.showError('Password is required');
      return false;
    }
    if (this.formData.password.length < 8) {
      this.fieldErrors.password = 'Password must be at least 8 characters';
      this.showError('Password must be at least 8 characters');
      return false;
    }

   
    if (!this.formData.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Please confirm your password';
      this.showError('Please confirm your password');
      return false;
    }
    if (!this.passwordsMatch()) {
      this.fieldErrors.confirmPassword = 'Passwords do not match';
      this.showError('Passwords do not match');
      return false;
    }

   
    if (!this.agreedToTerms) {
      this.showError('Please agree to Terms and Conditions');
      return false;
    }

    
    if (this.formData.role === UserRole.BUSINESS && this.formData.accessCode !== 'BUSINESS2024') {
      this.fieldErrors.accessCode = 'Invalid business access code';
      this.showError('Invalid business access code');
      return false;
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
              userType: registerRequest.role,
                message: 'Registration successful! Please check your email for verification code.'
              }
            });
          }, 2000);
        } else {
          this.handleApiError(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.handleApiError(error);
      }
    });
  }

  private handleApiError(error: any): void {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.error?.message) {
      const msg = error.error.message.toLowerCase();
      
      if (msg.includes('email') && (msg.includes('already') || msg.includes('exists') || msg.includes('taken'))) {
        this.fieldErrors.email = 'Email already registered';
        errorMessage = 'This email is already registered. Please use a different email or login';
      } else if (msg.includes('phone') && (msg.includes('already') || msg.includes('exists') || msg.includes('taken'))) {
        this.fieldErrors.phoneNumber = 'Phone number already registered';
        errorMessage = 'This phone number is already registered. Please use a different number';
      } else if (msg.includes('username') && (msg.includes('already') || msg.includes('exists') || msg.includes('taken'))) {
        this.fieldErrors.fullName = 'Username already taken';
        errorMessage = 'This username is already taken. Please choose a different name';
      } else if (msg.includes('invalid') && msg.includes('email')) {
        this.fieldErrors.email = 'Invalid email format';
        errorMessage = 'Please enter a valid email address';
      } else if (msg.includes('invalid') && msg.includes('phone')) {
        this.fieldErrors.phoneNumber = 'Invalid phone number';
        errorMessage = 'Please enter a valid phone number';
      } else if (msg.includes('weak') && msg.includes('password')) {
        this.fieldErrors.password = 'Password too weak';
        errorMessage = 'Password is too weak. Please use a stronger password';
      } else if (msg.includes('access code') || msg.includes('invalid code')) {
        this.fieldErrors.accessCode = 'Invalid access code';
        errorMessage = 'Invalid business access code';
      } else {
        errorMessage = error.error.message;
      }
    }
    
    this.showError(errorMessage);
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

 
  get isFormValid(): boolean {
    return (
      this.formData.role !== '' &&
      this.formData.fullName.trim() !== '' &&
      this.formData.fullName.trim().length >= 3 &&
      this.formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email) &&
      this.formData.phoneNumber.trim() !== '' &&
      /^(\+254|0)[1-9]\d{8}$/.test(this.formData.phoneNumber.replace(/\s/g, '')) &&
      this.formData.password !== '' &&
      this.formData.password.length >= 8 &&
      this.formData.confirmPassword !== '' &&
      this.passwordsMatch() &&
      this.agreedToTerms &&
      (this.formData.role !== UserRole.BUSINESS || this.formData.accessCode === 'BUSINESS2024')
    );
  }
}