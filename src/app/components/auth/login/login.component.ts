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
  
  // Error tracking
  emailError: string = '';
  passwordError: string = '';

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

  // Clear specific field errors on input
  onEmailInput(): void {
    this.emailError = '';
  }

  onPasswordInput(): void {
    this.passwordError = '';
  }

  validateForm(): boolean {
    this.emailError = '';
    this.passwordError = '';
    let isValid = true;

    // Email validation
    if (!this.loginData.email.trim()) {
      this.emailError = 'Email is required';
      this.showSnackbar('Email is required', 'error');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.loginData.email)) {
        this.emailError = 'Invalid email format';
        this.showSnackbar('Please enter a valid email address', 'error');
        isValid = false;
      }
    }

    // Password validation
    if (!this.loginData.password) {
      this.passwordError = 'Password is required';
      if (isValid) { // Only show if email passed
        this.showSnackbar('Password is required', 'error');
      }
      isValid = false;
    } else if (this.loginData.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      if (isValid) {
        this.showSnackbar('Password must be at least 6 characters', 'error');
      }
      isValid = false;
    }

    return isValid;
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
        
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          console.log('Current user after login:', user);
          
          let userRole: string | undefined;
          
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
        
        // Parse specific error messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.error?.message) {
          const msg = error.error.message.toLowerCase();
          
          if (msg.includes('email') && msg.includes('not found')) {
            this.emailError = 'Email not found';
            errorMessage = 'No account found with this email address';
          } else if (msg.includes('user') && msg.includes('not found')) {
            this.emailError = 'Account not found';
            errorMessage = 'No account found with this email address';
          } else if (msg.includes('password') && msg.includes('incorrect')) {
            this.passwordError = 'Incorrect password';
            errorMessage = 'Incorrect password. Please try again';
          } else if (msg.includes('invalid') && msg.includes('credentials')) {
            this.emailError = 'Invalid credentials';
            this.passwordError = 'Invalid credentials';
            errorMessage = 'Invalid email or password';
          } else if (msg.includes('account') && msg.includes('locked')) {
            errorMessage = 'Your account has been locked. Please contact support';
          } else if (msg.includes('account') && msg.includes('suspended')) {
            errorMessage = 'Your account has been suspended. Please contact support';
          } else if (msg.includes('not verified') || msg.includes('verify')) {
            errorMessage = 'Please verify your email address before logging in';
          } else if (msg.includes('disabled')) {
            errorMessage = 'Your account has been disabled. Please contact support';
          } else {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showSnackbar(errorMessage, 'error');
        this.loginData.password = '';
      }
    });
  }

  private redirectBasedOnRole(userRole: string): void {
    console.log('Redirecting based on role:', userRole);
    
    const normalizedRole = userRole.toUpperCase().trim();
    
    const roleMap: { [key: string]: string } = {
      'LANDLORD': '/landlord-dashboard/home',
      'TENANT': '/tenant-dashboard/home', 
      'BUSINESS': '/business-dashboard',
      'CARETAKER': '/caretaker-dashboard',
      'ADMIN': '/admin-dashboard'
    };

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
    this.emailError = '';
    this.passwordError = '';
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
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