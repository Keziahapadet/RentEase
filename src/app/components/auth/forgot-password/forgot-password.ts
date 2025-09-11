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

    return true;
  }

  async onSubmit() {
    if (!this.validateEmail()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: PasswordResetRequest = {
      email: this.email.trim().toLowerCase()
    };

    this.authService.requestPasswordReset(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.emailSent = true;
        this.successMessage = 'Password reset instructions have been sent to your email address.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      }
    });
  }

  resendEmail() {
    this.emailSent = false;
    this.successMessage = '';
    this.onSubmit();
  }

  navigateToLogin() {
    console.log('Navigating to login...');
    this.router.navigate(['/login']).then(
      (success) => console.log('Navigation to login successful:', success),
      (error) => console.error('Navigation to login failed:', error)
    );
  }

  navigateToHome() {
    console.log('Navigating to home...');
    this.router.navigate(['/']).then(
      (success) => console.log('Navigation to register successful:', success),
      (error) => console.error('Navigation to register failed:', error)
    );
  }
}