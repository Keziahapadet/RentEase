import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) return;

    this.isLoading = true;
    this.errorMessage = null;

    // Simulate login API call
    setTimeout(() => {
      this.isLoading = false;

      if (this.loginData.email === 'test@example.com' && this.loginData.password === '12345678') {
        this.successMessage = 'Login successful!';
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
    }, 1500);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
