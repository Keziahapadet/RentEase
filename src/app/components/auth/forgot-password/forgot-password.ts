import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { ForgotPasswordRequest, ApiResponse } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  countdown = 0;
  emailError = '';
  private countdownInterval: any;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  get isFormDisabled(): boolean {
    return this.isLoading || (this.emailSent && this.countdown > 0);
  }

  onEmailInput(): void {
    if (this.isLoading) return;
    this.emailError = '';
  }

  onSubmit(): void {
    if (this.isLoading) return;
    
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      
      if (this.email?.hasError('required')) {
        this.emailError = 'Email is required';
      } else if (this.email?.hasError('email')) {
        this.emailError = 'Invalid email format';
      }
      return;
    }

    this.isLoading = true;
    this.emailError = '';

    const request: ForgotPasswordRequest = {
      email: this.email?.value.trim().toLowerCase()
    };

    this.authService.requestPasswordReset(request).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.emailSent = true;
          this.startCountdown(60);
        
          this.showSnackBar(
            response.message || 'Password reset OTP has been sent to your email',
            'success'
          );

          setTimeout(() => {
            this.router.navigate(['/otp-verification'], {
              queryParams: { 
                email: this.email?.value.trim().toLowerCase(),
                type: 'password_reset'  
              }
            });
          }, 2000);

        } else {
          this.handleApiError(response.message || 'Failed to send password reset email');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        this.handleApiError(error);
      }
    });
  }

  private handleApiError(error: any): void {
    let errorMessage = 'We could not process your request. Please try again later';
    let fieldError = '';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.error?.message) {
      const msg = error.error.message.toLowerCase();
      
      if (msg.includes('email') && (msg.includes('not found') || msg.includes('does not exist'))) {
        fieldError = 'Email not registered';
        errorMessage = 'No account found with this email address';
      } else if (msg.includes('user') && msg.includes('not found')) {
        fieldError = 'Account not found';
        errorMessage = 'No account found with this email address';
      } else if (msg.includes('invalid') && msg.includes('email')) {
        fieldError = 'Invalid email format';
        errorMessage = 'Please enter a valid email address';
      } else if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('wait')) {
        fieldError = 'Too many attempts';
        errorMessage = 'Too many password reset attempts. Please try again in 15 minutes';
      } else if (msg.includes('account') && (msg.includes('locked') || msg.includes('suspended') || msg.includes('disabled'))) {
        fieldError = 'Account locked';
        errorMessage = 'Your account is locked. Please contact support';
      } else if (msg.includes('not verified') || msg.includes('verify email')) {
        fieldError = 'Email not verified';
        errorMessage = 'Please verify your email address first';
      } else if (msg.includes('email') && msg.includes('fail')) {
        errorMessage = 'Failed to send email. Please check your email address and try again';
      } else if (msg.includes('network') || msg.includes('connection')) {
        errorMessage = 'Connection problem. Check your internet and try again';
      } else if (msg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again';
      } else if (error.status === 500) {
        errorMessage = 'Temporary server issue. Please try again in a moment';
      } else {
        errorMessage = error.error.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your internet connection';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please wait 15 minutes before trying again';
    }
    
    if (fieldError) {
      this.emailError = fieldError;
    }
 
    this.showSnackBar(errorMessage, 'error');
  }

  resendEmail(): void {
    if (this.isLoading || this.countdown > 0) return;
    
    this.emailSent = false;
    this.onSubmit();
  }

  startCountdown(seconds: number): void {
    this.countdown = seconds;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  navigateToLogin(): void {
    if (this.isLoading) return;
    this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
  }

  navigateToHome(): void {
    if (this.isLoading) return;
    this.router.navigate(['/']).catch(err => console.error('Navigation error:', err));
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}