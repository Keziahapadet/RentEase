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
    MatInputModule
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
  resendTimer = 0;
  canResend = true;
  showOtpError = false;
  otpErrorMessage = '';

  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';

  pageTitle = 'OTP Verification';
  infoText = 'Enter the 7-character code sent to your email';

  private resendTimerInterval: any;
  private subscription = new Subscription();

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.initializeComponent();
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

        console.log('OTP Component - Email:', this.email);
        console.log('OTP Component - Verification Type:', this.verificationType);

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
        this.pageTitle = 'OTP Verification';
        this.infoText = 'Enter the 7-character code sent to your email';
        break;
      case 'password_reset':
        this.pageTitle = 'Reset Password Verification';
        this.infoText = 'Enter the 7-character code sent to your email to reset your password';
        break;
      default:
        this.pageTitle = 'OTP Verification';
        this.infoText = 'Enter the 7-character verification code';
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
    this.otpErrorMessage = '';

    try {
      const verifyRequest: OtpVerifyRequest = {
        email: this.email,
        otpCode: otpCode,
        type: this.verificationType
      };

      console.log('Sending OTP verification request:', verifyRequest);

      const response = await firstValueFrom(this.authService.verifyOtp(verifyRequest));

      if (response.success) {
        this.showMessage('Verification successful! 🎉', 'success');
        await this.handleSuccessfulVerification(response);
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      this.handleVerificationError(error);
      this.shakeInputs();
      this.clearOtpInputs();
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

  private async handleSuccessfulVerification(response: any) {
    console.log('Verification successful');
    console.log('Verification Type:', this.verificationType);
    
    // Add a small delay to ensure message is seen
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (this.verificationType === 'password_reset') {
        // For password reset - navigate to reset password page
        sessionStorage.setItem('resetEmail', this.email);
        sessionStorage.setItem('otpVerified', 'true');
        console.log('Navigating to reset-password with email:', this.email);
        
        this.router.navigate(['/reset-password'], { 
          queryParams: { 
            email: this.email,
            verified: 'true'
          } 
        });
      } else {
        // For other verification types, go to login
        this.showMessage('Verification successful! Please login.', 'success');
        this.router.navigate(['/login']);
      }
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      this.showMessage('Navigation failed. Please login manually.', 'error');
      this.router.navigate(['/login']);
    }
  }

  private handleVerificationError(error: any) {
    const errorMsg = (error.message || '').toLowerCase();
    
    if (errorMsg.includes('expired')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Code has expired. Please request a new one.';
      this.showMessage('Code has expired. Please request a new one.', 'error');
      this.canResend = true;
    } else if (errorMsg.includes('invalid')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Invalid code. Please check and try again.';
      this.showMessage('Invalid code. Please check and try again.', 'error');
    } else if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Account not found. Please check your email or register.';
      this.showMessage('Account not found. Please check your email or register.', 'error');
    } else if (errorMsg.includes('already verified')) {
      this.showMessage('Account already verified. Please login.', 'info');
      this.router.navigate(['/login']);
    } else {
      this.showOtpError = true;
      this.otpErrorMessage = error.message || 'Verification failed. Please try again.';
      this.showMessage(error.message || 'Verification failed. Please try again.', 'error');
    }
  }

  async resendOtp() {
    if (!this.canResend || this.isLoading || this.isResending) return;
    
    this.isResending = true;
    this.showOtpError = false;
    this.otpErrorMessage = '';

    try {
      const resendRequest: OtpRequest = {
        email: this.email,
        type: this.verificationType
      };

      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));

      if (response.success) {
        this.showMessage('New code sent! Check your email. ', 'success');
        this.startResendTimer();
        this.clearOtpInputs();
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error: any) {
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
    
    // Clear any previous error when user starts typing
    this.showOtpError = false;
    this.otpErrorMessage = '';
    
    if (position === 1) {
      value = value.replace(/[^A-Z]/g, '');
    } else {
      value = value.replace(/[^0-9]/g, '');
    }

    const digitKey = `digit${position}` as keyof typeof this.otpData;
    this.otpData[digitKey] = value.slice(-1);

    if (value && position < 7) {
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) nextInput.nativeElement.focus();
    }

    if (this.isOtpComplete() && !this.isLoading) {
      setTimeout(() => this.verifyOtp(), 300);
    }
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    
    if (event.key === 'Backspace') {
      event.preventDefault();
      // Clear error on backspace
      this.showOtpError = false;
      this.otpErrorMessage = '';
      
      if (this.otpData[digitKey]) {
        this.otpData[digitKey] = '';
      } else if (position > 1) {
        const prevKey = `digit${position - 1}` as keyof typeof this.otpData;
        this.otpData[prevKey] = '';
        const prevInput = this.otpInputs.toArray()[position - 2];
        if (prevInput) prevInput.nativeElement.focus();
      }
    } else if (event.key === 'Enter' && this.isOtpComplete() && !this.isLoading) {
      this.verifyOtp();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    // Clear error on paste
    this.showOtpError = false;
    this.otpErrorMessage = '';
    
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanOtp = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

    for (let i = 0; i < cleanOtp.length && i < 7; i++) {
      const key = `digit${i + 1}` as keyof typeof this.otpData;
      const char = cleanOtp[i];
      this.otpData[key] = i === 0 ? (/[A-Z]/.test(char) ? char : '') : (/[0-9]/.test(char) ? char : '');
    }

    if (cleanOtp.length === 7) {
      setTimeout(() => this.verifyOtp(), 300);
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

  private navigateToStart() {
    const startRoute = this.verificationType === 'password_reset' ? '/forgot-password' : '/registration';
    this.router.navigate([startRoute]);
  }

  getResendText(): string {
    if (this.isResending) return 'Sending...';
    return this.canResend ? 'Resend Code' : `Resend in ${this.resendTimer}s`;
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

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`snackbar-${type}`]
    });
  }
}