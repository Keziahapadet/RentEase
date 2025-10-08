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

  otpData = { digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '', digit7: '' };
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
      const verifyRequest: OtpVerifyRequest = { email: this.email, otpCode, type: this.verificationType };
      const response = await firstValueFrom(this.authService.verifyOtp(verifyRequest));
      if (response.success) {
        this.showMessage('Verification successful!', 'success');
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (this.verificationType === 'password_reset') {
          sessionStorage.setItem('resetEmail', this.email);
          sessionStorage.setItem('otpVerified', 'true');
          this.router.navigate(['/reset-password'], {
            queryParams: { email: this.email, verified: 'true' }
          });
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error: any) {
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
    if (!/^[A-Z][0-9]{6}$/.test(otpCode)) return 'Code must be 1 letter followed by 6 numbers (e.g., A123456).';
    return null;
  }

  private handleVerificationError(error: any) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('expired')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Code expired. Please request a new one.';
      this.showMessage('Code expired. Please request a new one.', 'error');
      this.canResend = true;
    } else if (msg.includes('invalid')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Invalid code. Try again.';
      this.showMessage('Invalid code. Try again.', 'error');
    } else if (msg.includes('not found')) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Account not found. Check your email.';
      this.showMessage('Account not found. Check your email.', 'error');
    } else {
      this.showOtpError = true;
      this.otpErrorMessage = error.message || 'Verification failed. Try again.';
      this.showMessage(error.message || 'Verification failed. Try again.', 'error');
    }
  }

  async resendOtp() {
    if (!this.canResend || this.isLoading || this.isResending) return;
    this.isResending = true;
    this.showOtpError = false;
    this.otpErrorMessage = '';
    try {
      const resendRequest: OtpRequest = { email: this.email, type: this.verificationType };
      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));
      if (response.success) {
        this.showMessage('New code sent! Check your email.', 'success');
        this.startResendTimer();
        this.clearOtpInputs();
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      this.showOtpError = true;
      this.otpErrorMessage = error.message || 'Failed to resend code.';
      this.showMessage(error.message || 'Failed to resend code.', 'error');
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
    this.showOtpError = false;
    this.otpErrorMessage = '';
    value = position === 1 ? value.replace(/[^A-Z]/g, '') : value.replace(/[^0-9]/g, '');
    const key = `digit${position}` as keyof typeof this.otpData;
    this.otpData[key] = value.slice(-1);
    if (value && position < 7) {
      const nextInput = this.otpInputs.toArray()[position];
      if (nextInput) nextInput.nativeElement.focus();
    }
    if (this.isOtpComplete() && !this.isLoading) setTimeout(() => this.verifyOtp(), 300);
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const key = `digit${position}` as keyof typeof this.otpData;
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.showOtpError = false;
      this.otpErrorMessage = '';
      if (this.otpData[key]) {
        this.otpData[key] = '';
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
    this.showOtpError = false;
    this.otpErrorMessage = '';
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanOtp = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    for (let i = 0; i < cleanOtp.length && i < 7; i++) {
      const key = `digit${i + 1}` as keyof typeof this.otpData;
      const char = cleanOtp[i];
      this.otpData[key] = i === 0 ? (/[A-Z]/.test(char) ? char : '') : (/[0-9]/.test(char) ? char : '');
    }
    if (cleanOtp.length === 7) setTimeout(() => this.verifyOtp(), 300);
  }

  isOtpComplete(): boolean {
    return Object.values(this.otpData).every(d => d.length === 1);
  }

  private clearOtpInputs() {
    Object.keys(this.otpData).forEach(k => (this.otpData as any)[k] = '');
    setTimeout(() => {
      const first = this.otpInputs.first;
      if (first) first.nativeElement.focus();
    }, 100);
  }

  private shakeInputs() {
    const c = document.querySelector('.otp-inputs');
    if (c) {
      c.classList.add('shake');
      setTimeout(() => c.classList.remove('shake'), 500);
    }
  }

  goBack() {
    const map: any = {
      password_reset: '/forgot-password',
      email_verification: '/registration',
      '2fa': '/login',
      phone_verification: '/settings'
    };
    this.router.navigate([map[this.verificationType] || '/login']);
  }

  private navigateToStart() {
    const route = this.verificationType === 'password_reset' ? '/forgot-password' : '/registration';
    this.router.navigate([route]);
  }

  getResendText(): string {
    if (this.isResending) return 'Sending...';
    return this.canResend ? 'Resend Code' : `Resend in ${this.resendTimer}s`;
  }

  getDisplayEmail(): string {
    if (!this.email) return '';
    const [local, domain] = this.email.split('@');
    if (!domain) return this.email;
    const masked = local.length > 2 ? local.substring(0, 2) + '*'.repeat(Math.min(local.length - 2, 3)) : local;
    return `${masked}@${domain}`;
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
