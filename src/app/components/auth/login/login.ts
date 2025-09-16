

import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest, AdminAuthResponse, UserAuthResponse, UserRole } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private authService: AuthService = inject(AuthService);

  loginData = { 
    email: '', 
    password: '' 
  };
  
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    console.log('Login component initialized');
    
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting...');
      this.redirectToDashboard();
      return;
    }


    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log('Return URL set to:', this.returnUrl);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateForm(): boolean {
    this.errorMessage = null;

    if (!this.loginData.email.trim()) {
      this.errorMessage = 'Email is required.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (!this.loginData.password) {
      this.errorMessage = 'Password is required.';
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const loginRequest: LoginRequest = {
      email: this.loginData.email.trim().toLowerCase(),
      password: this.loginData.password,
      rememberMe: this.rememberMe
    };

    this.authService.login(loginRequest).subscribe({
      next: (response: AdminAuthResponse | UserAuthResponse) => {
        this.isLoading = false;
        this.successMessage = 'Login successful!';
        
        setTimeout(() => {
          this.redirectBasedOnRole(response.user.role);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        
        // Clear password on error for security
        this.loginData.password = '';
      }
    });
  }

  private redirectBasedOnRole(userRole: string): void {
    console.log('Redirecting based on role:', userRole);
    
    switch (userRole.toUpperCase()) {
      case UserRole.ADMIN:
        this.router.navigate(['/admin-dashboard']);
        break;
      case UserRole.TENANT:
        this.router.navigate(['/tenant-dashboard']);
        break;
      case UserRole.LANDLORD:
        this.router.navigate(['/landlord-dashboard']);
        break;
      case UserRole.PROPERTY_MANAGER:
        this.router.navigate(['/property-manager-dashboard']);
        break;
      default:
        console.log('Unknown role, redirecting to default:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
    }
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.redirectBasedOnRole(user.role);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToForgotPassword(): void {
    console.log('Attempting to navigate to forgot-password');
    
    this.router.navigate(['/forgot-password']).then(
      (success) => console.log('Navigation to forgot-password successful:', success),
      (error) => console.error('Navigation to forgot-password failed:', error)
    );
  }

  navigateToRegister(): void {
    console.log('Attempting to navigate to register');
    
    this.router.navigate(['/registration']).then(
      (success) => console.log('Navigation to register successful:', success),
      (error) => console.error('Navigation to register failed:', error)
    );
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }
}