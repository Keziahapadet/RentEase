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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
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
  autoSubmitTimer: any;
  countdown: number = 3;
  
  emailError: string = '';
  passwordError: string = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
      return;
    }
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    const emailFromReset = this.route.snapshot.queryParams['email'];
    const passwordFromReset = this.route.snapshot.queryParams['prefillPassword'];
    
    if (emailFromReset && passwordFromReset) {
      this.loginData.email = emailFromReset;
      this.loginData.password = passwordFromReset;
      
      this.startAutoSubmitCountdown();
    }
    
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.showSnackbar(message, 'success');
    }
  }

  startAutoSubmitCountdown(): void {
    this.countdown = 3;
    this.autoSubmitTimer = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        clearInterval(this.autoSubmitTimer);
        if (this.isFormValid && !this.isLoading) {
          this.onSubmit();
        }
      }
    }, 1000);
  }

  stopAutoSubmit(): void {
    if (this.autoSubmitTimer) {
      clearInterval(this.autoSubmitTimer);
      this.countdown = 0;
    }
  }

  validateEmail(email: string): string {
    if (!email.trim()) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.includes('@')) {
      return 'Email needs @ symbol';
    }
    
    if (!email.includes('.')) {
      return 'Email needs domain (e.g., .com)';
    }
    
    if (!emailRegex.test(email)) {
      return 'Please check your email format';
    }
    
    return '';
  }

  togglePasswordVisibility(): void {
    if (this.isLoading) return;
    this.showPassword = !this.showPassword;
  }

  onEmailInput(): void {
    if (this.isLoading) return;
    this.emailError = '';
    this.stopAutoSubmit();
  }

  onEmailBlur(): void {
    if (this.isLoading) return;
    const email = this.loginData.email;
    if (email) {
      this.emailError = this.validateEmail(email);
    }
  }

  onPasswordInput(): void {
    if (this.isLoading) return;
    this.passwordError = '';
    this.stopAutoSubmit();
  }

  onPasswordBlur(): void {
    if (this.isLoading) return;
    const password = this.loginData.password;
    if (password && password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
    }
  }

  validateForm(): boolean {
    this.emailError = '';
    this.passwordError = '';
    
    const emailError = this.validateEmail(this.loginData.email);
    if (emailError) {
      this.emailError = emailError;
    }
    
    if (!this.loginData.password) {
      this.passwordError = 'Password is required';
    } else if (this.loginData.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
    }

    return !this.emailError && !this.passwordError;
  }

  onSubmit(): void {
    this.stopAutoSubmit();
    
    if (this.isLoading) return;
    
    if (!this.validateForm()) return;
    
    this.isLoading = true;
    const loginRequest: LoginRequest = {
      email: this.loginData.email.trim().toLowerCase(),
      password: this.loginData.password,
      rememberMe: this.rememberMe
    };
    
    this.authService.login(loginRequest).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        
        const user = this.authService.getCurrentUser();
        
        let userRole: string | undefined;
        
        if (user?.role) {
          userRole = user.role;
        } else if (response.role) {
          userRole = response.role;
        } else if (response.user?.role) {
          userRole = response.user.role;
        }
        
        if (userRole) {
          this.showSnackbar('Login successful!', 'success');
          this.redirectBasedOnRole(userRole);
        } else {
          this.showSnackbar('Login successful!', 'success');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleApiError(error);
      }
    });
  }

  private handleApiError(error: any): void {
    let errorMessage = 'Login failed. Please try again.';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.error?.message) {
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

  private redirectBasedOnRole(userRole: string): void {
    const normalizedRole = userRole.toUpperCase().trim();
    
    const roleMap: { [key: string]: string } = {
      'LANDLORD': '/landlord-dashboard',
      'TENANT': '/tenant-dashboard', 
      'BUSINESS': '/business-dashboard',
      'CARETAKER': '/caretaker-dashboard',
      'ADMIN': '/admin-dashboard'
    };

    const dashboardRoute = roleMap[normalizedRole] || '/dashboard';
    
    this.router.navigate([dashboardRoute]).then(success => {
      if (!success) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    
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
      !this.emailError
    );
  }

  get loginButtonText(): string {
    if (this.isLoading) return 'Logging in...';
    if (this.countdown > 0) return `Logging in... (${this.countdown})`;
    return 'Login';
  }

  resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.rememberMe = false;
    this.isLoading = false;
    this.emailError = '';
    this.passwordError = '';
    this.stopAutoSubmit();
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

  ngOnDestroy(): void {
    this.stopAutoSubmit();
  }
}