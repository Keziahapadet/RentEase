// src/app/components/forgot-password/forgot-password.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  emailSent = false;

  // Validate the email field
  validateEmail(): boolean {
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  // Handle form submission
  onSubmit(): void {
    if (!this.validateEmail()) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request: PasswordResetRequest = { email: this.email.trim().toLowerCase() };

    this.authService.requestPasswordReset(request).subscribe({
      next: (response: { success: boolean; message: string }) => {
        this.isLoading = false;
        if (response.success) {
          this.emailSent = true;
          this.successMessage = response.message || 'Password reset instructions have been sent to your email address.';
        } else {
          this.errorMessage = response.message || 'Failed to send password reset email.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to send password reset email.';
      }
    });
  }

  // Resend password reset email
  resendEmail(): void {
    this.emailSent = false;
    this.successMessage = '';
    this.onSubmit();
  }

  // Navigation helpers
  navigateToLogin(): void {
    this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
  }

  navigateToHome(): void {
    this.router.navigate(['/']).catch(err => console.error('Navigation error:', err));
  }
}
