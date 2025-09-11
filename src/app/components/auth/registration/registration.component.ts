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
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
    MatButtonModule,
    HttpClientModule
  ]
})
export class RegistrationComponent implements OnInit {
  private router: Router = inject(Router);
  private http: HttpClient = inject(HttpClient);

  formData: FormData = {
    role: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  agreedToTerms = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
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
    if (this.formData.role !== 'ADMIN') {
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
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(this.formData.phoneNumber.replace(/\s/g, ''))) {
      this.errorMessage = 'Invalid Kenyan phone number'; return false;
    }

    if (!this.formData.password) { this.errorMessage = 'Password required'; return false; }
    if (this.formData.password.length < 8) { this.errorMessage = 'Password must be at least 8 characters'; return false; }
    if (!this.formData.confirmPassword) { this.errorMessage = 'Confirm your password'; return false; }
    if (!this.passwordsMatch()) { this.errorMessage = 'Passwords do not match'; return false; }

    if (!this.agreedToTerms) { this.errorMessage = 'Please agree to Terms and Conditions'; return false; }
    if (this.formData.role === 'ADMIN' && this.formData.accessCode !== 'ADMIN2024') {
      this.errorMessage = 'Invalid admin access code'; return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phoneNumber: this.formData.phoneNumber.replace(/\s/g, ''),
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
      role: this.formData.role.toUpperCase() 
    };

    this.http.post('http://10.20.33.70:8080/api/auth/signup', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'User registered successfully!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed';
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
}
