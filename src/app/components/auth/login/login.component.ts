import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest, UserRole, AuthResponse } from '../../../services/auth-interfaces';

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
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private authService: AuthService = inject(AuthService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  loginData = { email: '', password: '' };
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.showSnackbar(message, 'success');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateForm(): boolean {
    if (!this.loginData.email.trim()) {
      this.showSnackbar('Email is required.', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.showSnackbar('Please enter a valid email address.', 'error');
      return false;
    }
    if (!this.loginData.password) {
      this.showSnackbar('Password is required.', 'error');
      return false;
    }
    if (this.loginData.password.length < 6) {
      this.showSnackbar('Password must be at least 6 characters.', 'error');
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) return;
    this.isLoading = true;
    const loginRequest: LoginRequest = {
      email: this.loginData.email.trim().toLowerCase(),
      password: this.loginData.password,
      rememberMe: this.rememberMe
    };
    
    this.authService.login(loginRequest).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login response:', response);
        
        // Wait a bit to ensure user data is stored
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          console.log('Current user after login:', user);
          
          let userRole: string | undefined;
          
          // Get role from multiple possible sources
          if (user && user.role) {
            userRole = user.role;
          } else if (response.role) {
            userRole = response.role;
          } else if (response.user?.role) {
            userRole = response.user.role;
          }
          
          console.log('Determined user role:', userRole);
          
          if (userRole) {
            this.showSnackbar('Login successful!', 'success');
            this.redirectBasedOnRole(userRole);
          } else {
            this.showSnackbar('Login successful! Redirecting to dashboard...', 'success');
            this.router.navigate(['/dashboard']);
          }
        }, 100);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.showSnackbar(error.message || 'Login failed. Please try again.', 'error');
        this.loginData.password = '';
      }
    });
  }

  private redirectBasedOnRole(userRole: string): void {
    console.log('Redirecting based on role:', userRole);
    
    // Normalize the role string for comparison
    const normalizedRole = userRole.toUpperCase().trim();
    
    // Map roles to their respective dashboards
    const roleMap: { [key: string]: string } = {
      'LANDLORD': '/landlord-dashboard/home',
      'TENANT': '/tenant-dashboard/home', 
      'BUSINESS': '/business-dashboard',
      'CARETAKER': '/caretaker-dashboard',
      'ADMIN': '/admin-dashboard'
    };

    // Check if role exists in our map
    if (roleMap[normalizedRole]) {
      const dashboardRoute = roleMap[normalizedRole];
      console.log(`Redirecting to: ${dashboardRoute}`);
      this.router.navigate([dashboardRoute]).then(success => {
        if (!success) {
          console.warn(`Failed to navigate to ${dashboardRoute}, falling back to /dashboard`);
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      console.warn(`Unknown role: ${userRole}, redirecting to default dashboard`);
      this.router.navigate(['/dashboard']);
    }
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    console.log('User from auth service:', user);
    
    if (user?.role) {
      this.redirectBasedOnRole(user.role);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToForgotPassword(): void {
    if (this.isLoading) return;
    this.router.navigate(['/forgot-password']);
  }

  navigateToRegister(): void {
    if (this.isLoading) return;
    this.router.navigate(['/registration']);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading) {
      this.onSubmit();
    }
  }

  get isFormValid(): boolean {
    return (
      this.loginData.email.trim() !== '' &&
      this.loginData.password !== '' &&
      this.loginData.password.length >= 6 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginData.email)
    );
  }

  resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.rememberMe = false;
    this.isLoading = false;
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass:
        type === 'success'
          ? ['snackbar-success']
          : type === 'error'
          ? ['snackbar-error']
          : ['snackbar-info']
    });
  }
}