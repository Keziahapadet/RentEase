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
import { LoginRequest, UserRole } from '../../../services/auth-interfaces';

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
    console.log('Login component initialized');

    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting...');
      this.redirectToDashboard();
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log('Return URL set to:', this.returnUrl);

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
    console.log('LOGIN BUTTON CLICKED!');
    console.log('Form data:', { 
      email: this.loginData.email, 
      password: '***', 
      rememberMe: this.rememberMe 
    });

    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    this.isLoading = true;

    const loginRequest: LoginRequest = {
      email: this.loginData.email.trim().toLowerCase(),
      password: this.loginData.password,
      rememberMe: this.rememberMe
    };

    console.log('Sending login request to backend...');

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('LOGIN SUCCESSFUL:', response);

        const user = this.authService.getCurrentUser();
        console.log('User data retrieved:', user);

        this.showSnackbar('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          if (user?.role) {
            this.redirectBasedOnRole(user.role);
          } else {
            this.router.navigate([this.returnUrl]);
          }
        }, 1500);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        this.showSnackbar(error.message || 'Login failed. Please try again.', 'error');
        this.loginData.password = '';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(userRole: string): void {
    const role = userRole.toUpperCase();
    switch (role) {
      case UserRole.BUSINESS:
        this.router.navigate(['/business-dashboard']).catch(() => 
          this.router.navigate(['/dashboard'])
        );
        break;
      case UserRole.TENANT:
        this.router.navigate(['/tenant-dashboard']).catch(() => 
          this.router.navigate(['/dashboard'])
        );
        break;
      case UserRole.LANDLORD:
        this.router.navigate(['/landlord-dashboard']).catch(() => 
          this.router.navigate(['/dashboard'])
        );
        break;
      case UserRole.CARETAKER:
        this.router.navigate(['/caretaker-dashboard']).catch(() => 
          this.router.navigate(['/dashboard'])
        );
        break;
      default:
        this.router.navigate([this.returnUrl]);
    }
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
    return this.loginData.email.trim() !== '' && 
           this.loginData.password !== '' && 
           this.loginData.password.length >= 6 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginData.email);
  }

  resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.rememberMe = false;
    this.isLoading = false;
  }
  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}
