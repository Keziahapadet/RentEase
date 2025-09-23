// =======================
// src/app/components/verify-otp/verify-otp.component.ts
// =======================

import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { OtpVerifyRequest, OtpRequest } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss']
})
export class VerifyOtpComponent implements AfterViewInit, OnInit, OnDestroy {
  
  constructor(
  private router: Router,
  private route: ActivatedRoute,
  private authService: AuthService
) {}


  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  // OTP Data
  otpData = {
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: '',
    digit7: ''
  };

  // Component State
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  resendTimer = 0;
  canResend = true;

  // Route Data
  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';
  userType: 'landlord' | 'tenant' = 'tenant';

  // UI Text
  pageTitle = 'Verify Your Account';
  infoText = 'We\'ve sent a 7-character verification code to your email';
 private subscription = new Subscription();
  private resendTimerInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.initializeComponent();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const firstInput = this.otpInputs.first?.nativeElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.clearResendTimer();
  }

  // ================= INITIALIZATION =================
  private initializeComponent() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.verificationType = params['type'] || 'email_verification';
      this.userType = params['userType'] || 'tenant';
      
      if (!this.email) {
        this.errorMessage = 'No email address found. Please start the verification process again.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        return;
      }

      this.updateUIBasedOnType();
      console.log('Initialized with:', { email: this.email, type: this.verificationType, userType: this.userType });
    });
  }

  private updateUIBasedOnType() {
    switch (this.verificationType) {
      case 'email_verification':
        if (this.userType === 'landlord') {
          this.pageTitle = 'Verify Your Landlord Account';
          this.infoText = 'We\'ve sent a 7-character verification code to your email address to complete your landlord registration';
        } else {
          this.pageTitle = 'Verify Your Tenant Account';
          this.infoText = 'We\'ve sent a 7-character verification code to your email address to complete your tenant registration';
        }
        break;
      case 'password_reset':
        this.pageTitle = 'Reset Password Verification';
        this.infoText = 'Enter the 7-character code sent to your email to reset your password';
        break;
      case '2fa':
        this.pageTitle = 'Two-Factor Authentication';
        this.infoText = 'Enter the 7-character code from your authenticator app or SMS';
        break;
      case 'phone_verification':
        this.pageTitle = 'Verify Phone Number';
        this.infoText = 'Enter the 7-character code sent to your phone number';
        break;
      default:
        this.pageTitle = 'Verify Your Account';
        this.infoText = 'We\'ve sent a 7-character verification code to your email';
    }
  }

  // ================= OTP VERIFICATION =================
  async verifyOtp() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const otpCode = Object.values(this.otpData).join('').toUpperCase().trim();

      const validationError = this.validateOtp(otpCode);
      if (validationError) {
        this.errorMessage = validationError;
        this.shakeInputs();
        return;
      }

      const verifyRequest: OtpVerifyRequest = {
        email: this.email,
        otpCode: otpCode,
        type: this.verificationType
      };

      const response = await firstValueFrom(this.authService.verifyOtp(verifyRequest));

      if (response.success) {
        this.successMessage = response.message || 'Verification successful! Redirecting...';
        await this.handleSuccessfulVerification();
      } else {
        this.errorMessage = response.message || 'Verification failed. Please check your code and try again.';
        this.shakeInputs();
      }

    } catch (error: any) {
      console.error('OTP verification error:', error);
      this.handleVerificationError(error);
      this.shakeInputs();
    } finally {
      this.isLoading = false;
    }
  }

  private validateOtp(otpCode: string): string | null {
    if (!otpCode) return 'Please enter the verification code.';
    if (otpCode.length !== 7) return 'Please enter all 7 characters of the verification code.';
    if (!this.email) return 'Email address is missing. Please try again.';
    if (!/^[A-Z0-9]{7}$/.test(otpCode)) return 'Verification code should contain only letters and numbers.';
    return null;
  }

  private async handleSuccessfulVerification() {
    const redirectDelay = 2000;

    switch (this.verificationType) {
      case 'email_verification':
        setTimeout(() => {
          if (this.userType === 'landlord') this.router.navigate(['/landlord-dashboard']);
          else this.router.navigate(['/tenant-dashboard']);
        }, redirectDelay);
        break;
      case 'password_reset':
        sessionStorage.setItem('resetEmail', this.email);
        setTimeout(() => this.router.navigate(['/reset-password']), redirectDelay);
        break;
      case '2fa':
        setTimeout(() => {
          if (this.userType === 'landlord') this.router.navigate(['/landlord-dashboard']);
          else this.router.navigate(['/tenant-dashboard']);
        }, redirectDelay);
        break;
      case 'phone_verification':
        setTimeout(() => this.router.navigate(['/profile']), redirectDelay);
        break;
      default:
        setTimeout(() => {
          if (this.userType === 'landlord') this.router.navigate(['/landlord-dashboard']);
          else this.router.navigate(['/tenant-dashboard']);
        }, redirectDelay);
    }
  }

  private handleVerificationError(error: any) {
    if (error.message) {
      if (error.message.includes('expired')) {
        this.errorMessage = 'Verification code has expired. Please request a new one.';
        this.canResend = true;
      } else if (error.message.includes('invalid') || error.message.includes('incorrect')) {
        this.errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.message.includes('attempts')) {
        this.errorMessage = 'Too many failed attempts. Please request a new code.';
        this.canResend = true;
      } else this.errorMessage = error.message;
    } else this.errorMessage = 'Verification failed. Please try again.';
  }

  // ================= RESEND OTP =================
  async resendOtp() {
    if (!this.canResend || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const resendRequest: OtpRequest = {
        email: this.email,
        type: this.verificationType
      };

      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));

      if (response.success) {
        this.successMessage = response.message || 'New verification code sent to your email!';
        this.startResendTimer();
        this.clearOtpInputs();
      } else {
        this.errorMessage = response.message || 'Failed to resend verification code. Please try again.';
      }

    } catch (error: any) {
      console.error('Resend OTP error:', error);
      this.errorMessage = error.message || 'Failed to resend verification code. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;

    this.clearResendTimer();
    this.resendTimerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.clearResendTimer();
        this.canResend = true;
      }
    }, 1000);
  }

  private clearResendTimer() {
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
      this.resendTimerInterval = undefined;
    }
  }

  // ================= INPUT HANDLING =================
  onDigitInput(event: any, position: number) {
    const input = event.target;
    let value = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    this.otpData[digitKey] = value.slice(-1);

    if (value && position < 7) {
      const nextInput = this.otpInputs.toArray()[position]?.nativeElement;
      if (nextInput) nextInput.focus();
    }

    if (this.isOtpComplete() && !this.isLoading) {
      setTimeout(() => this.verifyOtp(), 300);
    }
    this.clearMessages();
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.otpData[digitKey]) this.otpData[digitKey] = '';
      else if (position > 1) {
        const prevDigitKey = `digit${position - 1}` as keyof typeof this.otpData;
        this.otpData[prevDigitKey] = '';
        const prevInput = this.otpInputs.toArray()[position - 2]?.nativeElement;
        if (prevInput) prevInput.focus();
      }
    } else if (event.key === 'ArrowLeft' && position > 1) {
      const prevInput = this.otpInputs.toArray()[position - 2]?.nativeElement;
      if (prevInput) prevInput.focus();
    } else if (event.key === 'ArrowRight' && position < 7) {
      const nextInput = this.otpInputs.toArray()[position]?.nativeElement;
      if (nextInput) nextInput.focus();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.isOtpComplete() && !this.isLoading) this.verifyOtp();
    } else if ((event.key === 'v' && (event.ctrlKey || event.metaKey)) || event.type === 'paste') {
      event.preventDefault();
      setTimeout(() => this.handlePaste(), 0);
    }
  }

  private handlePaste() {
    navigator.clipboard.readText().then(text => {
      const cleanText = text.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 7);
      if (cleanText.length > 0) {
        for (let i = 0; i < Math.min(cleanText.length, 7); i++) {
          const digitKey = `digit${i + 1}` as keyof typeof this.otpData;
          this.otpData[digitKey] = cleanText[i];
        }
        if (cleanText.length === 7) {
          const lastInput = this.otpInputs.toArray()[6]?.nativeElement;
          if (lastInput) lastInput.focus();
          setTimeout(() => { if (this.isOtpComplete() && !this.isLoading) this.verifyOtp(); }, 300);
        } else {
          const nextInput = this.otpInputs.toArray()[cleanText.length]?.nativeElement;
          if (nextInput) nextInput.focus();
        }
        this.clearMessages();
      }
    }).catch(err => console.warn('Failed to read clipboard:', err));
  }

  isOtpComplete(): boolean {
    return Object.values(this.otpData).every(digit => digit.length === 1);
  }

  private clearOtpInputs() {
    Object.keys(this.otpData).forEach(key => { (this.otpData as any)[key] = ''; });
    setTimeout(() => {
      const firstInput = this.otpInputs.first?.nativeElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  private clearMessages() {
    if (this.errorMessage || this.successMessage) {
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  private shakeInputs() {
    const inputContainer = document.querySelector('.otp-inputs');
    if (inputContainer) {
      inputContainer.classList.add('shake');
      setTimeout(() => inputContainer.classList.remove('shake'), 500);
    }
  }

  // ================= PUBLIC METHODS =================
  goBack() {
    if (this.verificationType === 'password_reset') this.router.navigate(['/forgot-password']);
    else this.router.navigate(['/login']);
  }

  changeEmail() {
    this.goBack();
  }

  getResendText(): string {
    return this.canResend ? 'Resend Code' : `Resend code in ${this.resendTimer}s`;
  }

  getDisplayEmail(): string {
    if (!this.email) return '';
    const [localPart, domain] = this.email.split('@');
    if (!domain) return this.email;
    const maskedLocal = localPart.length <= 3 ? localPart : localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
    return `${maskedLocal}@${domain}`;
  }

  getUserTypeText(): string {
    return this.userType === 'landlord' ? 'Landlord' : 'Tenant';
  }

  debugOtp() {
    const otpCode = Object.values(this.otpData).join('');
    console.log('=== OTP DEBUG ===');
    console.log('Current OTP:', otpCode);
    console.log('OTP Length:', otpCode.length);
    console.log('Is Complete:', this.isOtpComplete());
    console.log('Email:', this.email);
    console.log('Type:', this.verificationType);
    console.log('User Type:', this.userType);
    console.log('Auth Service Debug:', this.authService.getDebugInfo());
    console.log('================');
  }
}
