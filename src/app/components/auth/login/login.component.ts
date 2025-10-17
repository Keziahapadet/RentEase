import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy {
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
  countdown: number = 0;
  showAutoLoginNotice: boolean = false;
  
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
      this.showAutoLoginNotice = true;
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
        this.stopAutoSubmit();
        if (this.isFormValid && !this.isLoading) {
          this.onSubmit();
        }
      }
    }, 1000);
  }

  stopAutoSubmit(): void {
    if (this.autoSubmitTimer) {
      clearInterval(this.autoSubmitTimer);
      this.autoSubmitTimer = null;
      this.showAutoLoginNotice = false;
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
   
    this.emailError = '';
    this.passwordError = '';
    
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
  
    this.emailError = '';
    this.passwordError = '';
    
    let errorMessage = 'Login failed. Please try again.';
    let showSnackbar = true;
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.error?.message) {
      const msg = error.error.message.toLowerCase();
      
     
      if (msg.includes('email') && msg.includes('not found')) {
        this.emailError = 'No account with this email';
        errorMessage = 'This email is not registered';
      } else if (msg.includes('user') && msg.includes('not found')) {
        this.emailError = 'Account not found';
        errorMessage = 'No account exists with this email';
      } else if (msg.includes('email') && msg.includes('invalid')) {
        this.emailError = 'Invalid email format';
        errorMessage = 'Please enter a valid email address';
      } else if (msg.includes('email') && msg.includes('required')) {
        this.emailError = 'Email is required';
        errorMessage = 'Please enter your email address';
      } else if (msg.includes('email') && msg.includes('exist')) {
        this.emailError = 'Email not registered';
        errorMessage = 'This email is not registered with us'; 
      } else if (msg.includes('password') && msg.includes('incorrect')) {
        this.passwordError = 'Wrong password';
        errorMessage = 'The password you entered is incorrect';
        showSnackbar = false;
      } else if (msg.includes('password') && msg.includes('invalid')) {
        this.passwordError = 'Invalid password';
        errorMessage = 'Please check your password';
        showSnackbar = false;
      } else if (msg.includes('password') && msg.includes('required')) {
        this.passwordError = 'Password required';
        errorMessage = 'Please enter your password';
        showSnackbar = false;
      } else if (msg.includes('invalid') && msg.includes('credentials')) {
        this.emailError = 'Check email or password';
        this.passwordError = 'Check email or password';
        errorMessage = 'The email or password you entered is incorrect';
      } else if (msg.includes('authentication') && msg.includes('failed')) {
        this.emailError = 'Incorrect email or password';
        this.passwordError = 'Incorrect email or password';
        errorMessage = 'Please check your email and password';
        
      } else if (msg.includes('account') && msg.includes('locked')) {
        errorMessage = 'Account temporarily locked. Try again in 30 minutes';
      } else if (msg.includes('account') && msg.includes('suspended')) {
        errorMessage = 'This account has been suspended';
      } else if (msg.includes('not verified') || msg.includes('verify')) {
        errorMessage = 'Please verify your email address before logging in';
      } else if (msg.includes('disabled')) {
        errorMessage = 'This account has been deactivated';
      } else if (msg.includes('inactive')) {
        errorMessage = 'Your account is not active';
        
      } else if (msg.includes('network') || msg.includes('connection')) {
        errorMessage = 'Connection problem. Check your internet';
      } else if (msg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again';
      } else if (error.status === 500) {
        errorMessage = 'Temporary server issue. Please try again';
      } else {
        errorMessage = error.error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Check your internet';
    } else if (error.status === 401) {
      this.emailError = 'Incorrect email or password';
      this.passwordError = 'Incorrect email or password';
      errorMessage = 'The email or password you entered is not correct';
    } else if (error.status === 404) {
      this.emailError = 'Email not registered';
      errorMessage = 'No account found with this email address';
    } else if (error.status === 429) {
      errorMessage = 'Too many login attempts. Please wait 15 minutes';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. Please contact support';
    }
    
    // Clear password field for wrong password or invalid credentials
    if (this.passwordError || 
        errorMessage.includes('password') || 
        errorMessage.includes('incorrect') ||
        errorMessage.includes('invalid credentials')) {
      this.loginData.password = '';
    }
    
    if (showSnackbar) {
      this.showSnackbar(errorMessage, 'error');
    }
  }

  private redirectBasedOnRole(userRole: string): void {
    const normalizedRole = userRole.toUpperCase().trim();
    
    const roleMap: { [key: string]: string } = {
      'LANDLORD': '/landlord-dashboard/home',
      'TENANT': '/tenant-dashboard/dashboard',
      'BUSINESS': '/business-dashboard',
      'CARETAKER': '/caretaker-dashboard/overview',
      'ADMIN': '/admin-dashboard'
    };

    const dashboardRoute = roleMap[normalizedRole] || '/tenant-dashboard/home';
    
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
    if (this.isLoading) return 'Signing In...';
    if (this.countdown > 0) return `Logging in... (${this.countdown})`;
    return 'Sign In';
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