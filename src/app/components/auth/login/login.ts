import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnDestroy {
  // Current step in the login flow
  currentStep: 'phone' | 'otp' | 'email-verify' = 'phone';
  
  // Form data
  phoneNumber: string = '';
  otpCode: string = '';
  emailAddress: string = '';
  userEmail: string = ''; // Retrieved from database
  
  // UI state
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // OTP countdown
  countdown: number = 0;
  countdownInterval: any;
  
  // Masked phone for display
  get maskedPhone(): string {
    if (this.phoneNumber.length > 4) {
      return this.phoneNumber.slice(0, 4) + '****' + this.phoneNumber.slice(-3);
    }
    return this.phoneNumber;
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    // Clean up reCAPTCHA verifier
    this.authService.cleanupRecaptcha();
  }

  // Step 1: Send OTP to phone number
  async sendOTP() {
    if (!this.phoneNumber.trim()) {
      this.showError('Please enter your phone number');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      // Check if phone number exists and send OTP
      const result = await this.authService.sendLoginOTP(this.phoneNumber);
      
      if (result.success) {
        this.userEmail = result.userEmail || '';
        this.currentStep = 'otp';
        this.startCountdown();
        this.showSuccess('OTP sent successfully!');
      } else {
        this.showError(result.message || 'Phone number not found. Please register first.');
      }
    } catch (error) {
      this.showError('Failed to send OTP. Please try again.');
      console.error('OTP send error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Step 2: Verify OTP
  async verifyOTP() {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.showError('Please enter the 6-digit code');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const result = await this.authService.verifyLoginOTP(this.phoneNumber, this.otpCode);
      
      if (result.success) {
        // Check if user has email and if email verification is required
        if (this.userEmail && result.requireEmailVerification) {
          this.emailAddress = this.userEmail;
          this.currentStep = 'email-verify';
          this.showSuccess('Phone verified! Additional email verification required.');
        } else {
          // Complete login
          this.completeLogin(result.user);
        }
      } else {
        this.showError(result.message || 'Invalid or expired code');
      }
    } catch (error) {
      this.showError('Verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Step 3: Send email verification (optional)
  async sendEmailVerification() {
    this.isLoading = true;
    this.clearMessages();

    try {
      const result = await this.authService.sendEmailVerification(this.emailAddress);
      
      if (result.success) {
        this.showSuccess('Email verification sent! Please check your inbox.');
        // For now, complete login after sending email
        setTimeout(() => {
          this.completeLogin(result.user);
        }, 2000);
      } else {
        this.showError(result.message || 'Failed to send email verification');
      }
    } catch (error) {
      this.showError('Email verification failed. Please try again.');
      console.error('Email verification error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Skip email verification and complete login
  skipEmailVerification() {
    this.completeLogin();
  }

  // Complete the login process
  completeLogin(user?: any) {
    this.showSuccess('Login successful! Redirecting...');
    
    // Store user data if provided
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    }

    // Redirect based on user role
    setTimeout(() => {
      if (user?.role) {
        switch (user.role) {
          case 'tenant':
            this.router.navigate(['/tenant-dashboard']);
            break;
          case 'landlord':
            this.router.navigate(['/landlord-dashboard']);
            break;
          case 'caretaker':
            this.router.navigate(['/caretaker-dashboard']);
            break;
          case 'business':
            this.router.navigate(['/business-dashboard']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      } else {
        this.router.navigate(['/dashboard']);
      }
    }, 1500);
  }

  // Resend OTP
  async resendOTP() {
    await this.sendOTP();
    this.otpCode = ''; // Clear previous OTP input
  }

  // Go back to phone number step
  goBackToPhone() {
    this.currentStep = 'phone';
    this.otpCode = '';
    this.stopCountdown();
    this.clearMessages();
  }

  // Navigate to registration
  navigateToRegistration() {
    this.router.navigate(['/registration']);
  }

  // Start countdown timer
  private startCountdown() {
    this.countdown = 60; // 60 seconds
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  // Stop countdown timer
  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdown = 0;
  }

  // Utility methods
  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}