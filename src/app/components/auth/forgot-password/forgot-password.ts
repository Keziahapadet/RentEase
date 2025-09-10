import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  async onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await sendPasswordResetEmail(this.auth, this.email.trim());
      this.successMessage = 'Password reset email sent! Check your inbox.';
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to send reset email';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToHome() {
    this.router.navigate(['/']);
  }
}
