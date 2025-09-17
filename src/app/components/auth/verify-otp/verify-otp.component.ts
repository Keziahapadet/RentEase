import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements AfterViewInit, OnInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  
  otpData = {
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  resendTimer = 0;
  canResend = true;
  
  // Parameters from route/navigation
  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';
  
  // Display text based on verification type
  pageTitle = 'Verify Your Account';
  infoText = 'We\'ve sent a 6-digit verification code to your email';
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get email and verification type from route params or navigation state
    this.route.queryParams.subscribe((params: any) => {
      this.email = params['email'] || '';
      this.verificationType = params['type'] || 'email_verification';
      this.updatePageContent();
    });

    // Alternative: Get from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'] || this.email;
      this.verificationType = navigation.extras.state['type'] || this.verificationType;
      this.updatePageContent();
    }

    // If no email provided, redirect back
    if (!this.email) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    // Focus first input on component load
    if (this.otpInputs.first) {
      this.otpInputs.first.nativeElement.focus();
    }
  }

  updatePageContent() {
    switch (this.verificationType) {
      case 'email_verification':
        this.pageTitle = 'Verify Your Email';
        this.infoText = `Please enter the verification code we sent to your email address`;
        break;
      case 'password_reset':
        this.pageTitle = 'Reset Your Password';
        this.infoText = `Please enter the reset code we sent to your email address`;
        break;
      case '2fa':
        this.pageTitle = 'Two-Factor Authentication';
        this.infoText = `Enter the 6-digit code from your authenticator app`;
        break;
      case 'phone_verification':
        this.pageTitle = 'Verify Your Phone';
        this.infoText = `Please enter the verification code we sent to your phone`;
        break;
    }
  }

  onInput(event: Event, position: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
      input.value = value;
    }

    // Update the model
    this.updateOtpDigit(position, value);

    // Move to next input if current is filled
    if (value && position < 6) {
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }

    // Clear error message when user starts typing
    if (this.errorMessage) {
      this.errorMessage = '';
    }

    // Auto-submit when all fields are filled
    if (this.isOtpComplete()) {
      setTimeout(() => this.onSubmit(), 100);
    }
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace') {
      if (!input.value && position > 1) {
        // Move to previous input if current is empty
        const prevInput = this.otpInputs.toArray()[position - 2];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && position > 1) {
      const prevInput = this.otpInputs.toArray()[position - 2];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
    
    if (event.key === 'ArrowRight' && position < 6) {
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }

    // Prevent non-numeric input
    if (!/\d/.test(event.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent, position: number) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text');
    
    if (pasteData && /^\d+$/.test(pasteData)) {
      const digits = pasteData.slice(0, 6).split('');
      
      // Fill inputs starting from current position
      for (let i = 0; i < digits.length && (position - 1 + i) < 6; i++) {
        const targetPosition = position + i;
        this.updateOtpDigit(targetPosition, digits[i]);
        
        const input = this.otpInputs.toArray()[position - 1 + i];
        if (input) {
          input.nativeElement.value = digits[i];
        }
      }

      // Focus the next empty input or the last input
      const nextEmptyPosition = Math.min(position + digits.length - 1, 6);
      const targetInput = this.otpInputs.toArray()[nextEmptyPosition - 1];
      if (targetInput) {
        targetInput.nativeElement.focus();
      }

      // Auto-verify if complete
      if (this.isOtpComplete()) {
        setTimeout(() => this.onSubmit(), 100);
      }
    }
  }

  updateOtpDigit(position: number, value: string) {
    switch (position) {
      case 1: this.otpData.digit1 = value; break;
      case 2: this.otpData.digit2 = value; break;
      case 3: this.otpData.digit3 = value; break;
      case 4: this.otpData.digit4 = value; break;
      case 5: this.otpData.digit5 = value; break;
      case 6: this.otpData.digit6 = value; break;
    }
  }

  getOtpValue(): string {
    return `${this.otpData.digit1}${this.otpData.digit2}${this.otpData.digit3}${this.otpData.digit4}${this.otpData.digit5}${this.otpData.digit6}`;
  }

  isOtpComplete(): boolean {
    const otp = this.getOtpValue();
    return otp.length === 6 && /^\d{6}$/.test(otp);
  }

  async onSubmit() {
    if (!this.isOtpComplete()) {
      this.errorMessage = 'Please enter the complete 6-digit verification code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const otpValue = this.getOtpValue();
      
      // Call your OTP verification API using AuthService
      const response = await this.authService.verifyOtp({
        email: this.email,
        otp: otpValue,
        type: this.verificationType
      }).toPromise();
      
      if (response?.success) {
        this.successMessage = response.message || 'Verification successful! Redirecting...';
        
        // Redirect after successful verification
        setTimeout(() => {
          this.redirectAfterVerification();
        }, 2000);
      } else {
        this.errorMessage = response?.message || 'Invalid verification code. Please try again.';
        this.clearOtp();
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Verification failed. Please try again.';
      console.error('OTP verification error:', error);
      this.clearOtp();
    } finally {
      this.isLoading = false;
    }
  }

  clearOtp() {
    this.otpData = {
      digit1: '',
      digit2: '',
      digit3: '',
      digit4: '',
      digit5: '',
      digit6: ''
    };

    // Clear input values
    this.otpInputs.forEach(input => {
      input.nativeElement.value = '';
    });
    
    // Focus first input
    if (this.otpInputs.first) {
      this.otpInputs.first.nativeElement.focus();
    }
  }

  async resendOtp() {
    if (!this.canResend || this.isLoading) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Call resend OTP API using AuthService
      const response = await this.authService.resendOtp({
        email: this.email,
        type: this.verificationType
      }).toPromise();
      
      if (response?.success) {
        this.successMessage = response.message || 'Verification code sent successfully!';
        this.startResendTimer();
        this.clearOtp();
      } else {
        this.errorMessage = response?.message || 'Failed to resend verification code.';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to resend verification code. Please try again.';
      console.error('Resend OTP error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  startResendTimer() {
    this.canResend = false;
    this.resendTimer = 30; // 30 seconds

    const timer = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(timer);
      }
    }, 1000);
  }

  redirectAfterVerification() {
    switch (this.verificationType) {
      case 'email_verification':
        // User just verified email after registration
        this.router.navigate(['/login'], { 
          queryParams: { message: 'Email verified successfully! Please log in.' }
        });
        break;
      
      case 'password_reset':
        // User is resetting password - go to reset password form
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email, verified: 'true' }
        });
        break;
      
      case '2fa':
        // Two-factor authentication - go to dashboard
        this.router.navigate(['/dashboard']);
        break;
      
      case 'phone_verification':
        // Phone verification - go to dashboard or profile
        this.router.navigate(['/dashboard']);
        break;
      
      default:
        this.router.navigate(['/login']);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  goBack() {
    switch (this.verificationType) {
      case 'email_verification':
        this.router.navigate(['/register']);
        break;
      case 'password_reset':
        this.router.navigate(['/forgot-password']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}