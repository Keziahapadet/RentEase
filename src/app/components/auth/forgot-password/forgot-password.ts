import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { PasswordResetRequest } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  email = '';
  isLoading = false;
  emailSent = false;

  validateEmail(): boolean {
    if (!this.email.trim()) {
      this.showSnackBar('Please enter your email address.', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showSnackBar('Please enter a valid email address.', 'error');
      return false;
    }

    return true;
  }
  onSubmit(): void {
    if (!this.validateEmail()) return;

    this.isLoading = true;

    const request: PasswordResetRequest = {
      email: this.email.trim().toLowerCase()
    };

    this.authService.requestPasswordReset(request).subscribe({
      next: (response: { success: boolean; message: string }) => {
        this.isLoading = false;
        if (response.success) {
          this.emailSent = true;
          this.showSnackBar(
            response.message ||
              'Password reset instructions have been sent to your email 📧',
            'success'
          );
        } else {
          this.showSnackBar(
            response.message || 'Failed to send password reset email ❌',
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
            'We could not process your request. Please try again later ❌',
          'error'
        );
      }
    });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }
  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
  }

  navigateToHome(): void {
    this.router.navigate(['/']).catch(err => console.error('Navigation error:', err));
  }
}
