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
    MatProgressSpinnerModule
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
  private countdownInterval: any;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

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
              queryParams: { email: this.email?.value.trim().toLowerCase() }
            });
          }, 2000);

        } else {
          this.showSnackBar(
            response.message || 'Failed to send password reset email ',
            'error'
          );
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        this.showSnackBar(
          error.error?.message ||
          error.message ||
          'We could not process your request. Please try again later ',
          'error'
        );
      }
    });
  }

  resendEmail(): void {
    if (this.countdown > 0) return;
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
    this.router.navigate(['/auth/login']).catch(err => console.error('Navigation error:', err));
  }

  navigateToHome(): void {
    this.router.navigate(['/']).catch(err => console.error('Navigation error:', err));
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
