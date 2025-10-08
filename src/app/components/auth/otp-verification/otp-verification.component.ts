import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { OtpVerifyRequest, OtpRequest } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  otpData = {
    digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '', digit7: ''
  };

  isLoading = false;
  isResending = false;
  resendTimer = 60;
  canResend = false;
  showOtpError = false;
  otpErrorMessage = '';

  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';

  pageTitle = 'OTP Verification';
  infoText = 'Enter the 7-character code sent to your email';
  buttonText = 'Verify Code';

  private resendTimerInterval: any;
  private subscription = new Subscription();

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.initializeComponent();
    this.startResendTimer();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const firstInput = this.otpInputs.first;
      if (firstInput) firstInput.nativeElement.focus();
    }, 100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.clearResendTimer();
  }

  private initializeComponent() {
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        this.email = (params['email'] || '').trim().toLowerCase();
        this.verificationType = params['type'] || 'email_verification';

        if (!this.email) {
          this.showMessage('No email found. Please restart the process.', 'error');
          setTimeout(() => this.navigateToStart(), 3000);
          return;
        }

        this.updateUIBasedOnType();
      })
    );
  }

  private updateUIBasedOnType() {
    switch (this.verificationType) {
      case 'email_verification':
        this.pageTitle = 'Verify Your Email';
        this.infoText = 'Enter the 7-character verification code sent to your email address';
        this.buttonText = 'Verify Email';
        break;
      case 'password_reset':
        this.pageTitle = 'Reset Password Verification';
        this.infoText = 'Enter the 7-character code sent to your email to reset your password';
        this.buttonText = 'Verify & Reset Password';
        break;
      default:
        this.pageTitle = 'OTP Verification';
        this.infoText = 'Enter the 7-character verification code';
        this.buttonText = 'Verify Code';
    }
  }

  async verifyOtp() {
    if (this.isLoading) return;

    const otpCode = Object.values(this.otpData).join('').toUpperCase();
    const validationError = this.validateOtp(otpCode);

    if (validationError) {
      this.showOtpError = true;
      this.otpErrorMessage = validationError;
      this.showMessage(validationError, 'error');
      this.shakeInputs();
      return;
    }

    this.isLoading = true;
    this.showOtpError = false;

    if (this.verificationType === 'password_reset') {
      this.showMessage('OTP verified! Please set your new password.', 'success');
      
      setTimeout(() => {
        this.router.navigate(['/reset-password'], {
          queryParams: {
            email: this.email,
            otp: otpCode
          }
        });
      }, 1000);
      
      this.isLoading = false;
      return;
    }

    try {
      const verifyRequest: OtpVerifyRequest = {
        email: this.email,
        otpCode: otpCode,
        type: this.verificationType
      };

      const response = await firstValueFrom(this.authService.verifyOtp(verifyRequest));

      if (response.success) {
        this.showMessage('Verification successful!', 'success');
        await this.handleSuccessfulVerification(response, otpCode);
      } else {
        throw new Error(response.message || 'Verification failed');
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
    if (otpCode.length !== 7) return `Code must be 7 characters. You entered ${otpCode.length}.`;
    if (!/^[A-Z][0-9]{6}$/.test(otpCode)) {
      return 'Code must be 1 letter followed by 6 numbers (e.g., A123456).';
    }
    return null;
  }

  private async handleSuccessfulVerification(response: any, otpCode: string) {
    if (this.verificationType === 'email_verification') {
      this.showMessage('Email verified successfully! Please login.', 'success');
      setTimeout(() => {
        this.router.navigate(['/login'], {
          queryParams: { 
            email: this.email,
            verified: 'true'
          }
        });
      }, 1500);
    }
  }

  private handleVerificationError(error: any) {
    let errorMessage = 'Verification failed. Please try again.';
    let userMessage = 'Verification failed. Please try again.';
    
    if (typeof error === 'string') {
      errorMessage = error;
      userMessage = error;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
      const msg = error.error.message.toLowerCase();
      
      if (msg.includes('expired')) {
        userMessage = 'Code has expired. Please request a new one.';
        this.canResend = true;
      } else if (msg.includes('invalid') || msg.includes('incorrect')) {
        userMessage = 'Invalid code. Please check and try again.';
      } else if (msg.includes('not found') || msg.includes('does not exist')) {
        userMessage = 'Account not found. Please check your email or register.';
      } else if (msg.includes('already verified')) {
        userMessage = 'Account already verified. Please login.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      } else {
        userMessage = error.error.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
      userMessage = error.message;
    }

    this.showOtpError = true;
    this.otpErrorMessage = userMessage;
    this.showMessage(userMessage, 'error');
    this.clearOtpInputs();
  }

  async resendOtp() {
    if (!this.canResend || this.isLoading || this.isResending) return;
    
    this.isResending = true;
    this.showOtpError = false;

    try {
      const resendRequest: OtpRequest = {
        email: this.email,
        type: this.verificationType
      };

      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));

      if (response.success) {
        this.showMessage('New verification code sent! Check your email.', 'success');
        this.startResendTimer();
        this.clearOtpInputs();
        
        setTimeout(() => {
          const firstInput = this.otpInputs.first;
          if (firstInput) firstInput.nativeElement.focus();
        }, 100);
        
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      this.showOtpError = true;
      this.otpErrorMessage = error.message || 'Failed to resend code. Please try again.';
      this.showMessage(error.message || 'Failed to resend code. Please try again.', 'error');
    } finally {
      this.isResending = false;
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
      this.resendTimerInterval = null;
    }
  }

  onDigitInput(event: any, position: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();
    
    if (position === 1) {
      value = value.replace(/[^A-Z]/g, '');
    } else {
      value = value.replace(/[^0-9]/g, '');
    }

    const digitKey = `digit${position}` as keyof typeof this.otpData;
    this.otpData[digitKey] = value.slice(-1);

    if (value && position < 7) {
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) {
        setTimeout(() => nextInput.nativeElement.focus(), 10);
      }
    }

    this.showOtpError = false;

    if (this.isOtpComplete() && !this.isLoading) {
      setTimeout(() => this.verifyOtp(), 300);
    }
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    
    if (event.key === 'Backspace') {
      if (!this.otpData[digitKey] && position > 1) {
        const prevInput = this.otpInputs.toArray()[position - 2];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      }
    } else if (event.key === 'Enter' && this.isOtpComplete() && !this.isLoading) {
      this.verifyOtp();
    } else if (event.key === 'ArrowLeft' && position > 1) {
      event.preventDefault();
      const prevInput = this.otpInputs.toArray()[position - 2];
      if (prevInput) prevInput.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && position < 7) {
      event.preventDefault();
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) nextInput.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanOtp = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

    for (let i = 0; i < cleanOtp.length && i < 7; i++) {
      const key = `digit${i + 1}` as keyof typeof this.otpData;
      const char = cleanOtp[i];
      this.otpData[key] = i === 0 ? (/[A-Z]/.test(char) ? char : '') : (/[0-9]/.test(char) ? char : '');
    }

    this.showOtpError = false;

    if (cleanOtp.length === 7) {
      setTimeout(() => this.verifyOtp(), 300);
    } else if (cleanOtp.length > 0) {
      const nextEmptyIndex = cleanOtp.length;
      const nextInput = this.otpInputs.toArray()[nextEmptyIndex];
      if (nextInput) nextInput.nativeElement.focus();
    }
  }

  isOtpComplete(): boolean {
    return Object.values(this.otpData).every(digit => digit.length === 1);
  }

  private clearOtpInputs() {
    Object.keys(this.otpData).forEach(key => {
      (this.otpData as any)[key] = '';
    });
    setTimeout(() => {
      const firstInput = this.otpInputs.first;
      if (firstInput) firstInput.nativeElement.focus();
    }, 100);
  }

  private shakeInputs() {
    const container = document.querySelector('.otp-inputs');
    if (container) {
      container.classList.add('shake');
      setTimeout(() => container.classList.remove('shake'), 500);
    }
  }

  goBack() {
    const routeMap: { [key: string]: string } = {
      'password_reset': '/forgot-password',
      'email_verification': '/registration',
      '2fa': '/login',
      'phone_verification': '/settings'
    };
    this.router.navigate([routeMap[this.verificationType] || '/login']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegistration() {
    this.router.navigate(['/registration']);
  }

  private navigateToStart() {
    const startRoute = this.verificationType === 'password_reset' ? '/forgot-password' : '/registration';
    this.router.navigate([startRoute]);
  }

  getResendText(): string {
    if (this.isResending) return 'Sending...';
    if (!this.canResend) return `Resend in ${this.resendTimer}s`;
    return 'Resend Code';
  }

  getDisplayEmail(): string {
    if (!this.email) return '';
    const [localPart, domain] = this.email.split('@');
    if (!domain) return this.email;
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(Math.min(localPart.length - 2, 3))
      : localPart;
    return `${maskedLocal}@${domain}`;
  }

  getOtpPattern(position: number): string {
    return position === 1 ? '[A-Z]' : '[0-9]';
  }

  getOtpMaxLength(position: number): number {
    return 1;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`snackbar-${type}`]
    });
  }
}