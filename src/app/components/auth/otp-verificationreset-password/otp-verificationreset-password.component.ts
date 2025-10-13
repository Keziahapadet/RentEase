import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { OtpVerifyRequest, OtpRequest } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-reset-password-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './otp-verificationreset-password.component.html',
  styleUrls: ['./otp-verificationreset-password.component.scss']
})
export class ResetPasswordOtpComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  otpData = {
    digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '', digit7: ''
  };

  isLoading = false;
  isResending = false;
  resendTimer = 0;
  canResend = true;
  expirationTimer = 600;
  isExpired = false;

  email = '';

  pageTitle = 'Reset Password Verification';
  infoText = 'We sent a verification code to your email';

  private resendTimerInterval: any;
  private expirationTimerInterval: any;
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
    this.clearExpirationTimer();
  }

  private initializeComponent() {
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        this.email = (params['email'] || '').trim().toLowerCase();

        if (!this.email) {
          this.showMessage('No email found. Please restart the process.', 'error');
          setTimeout(() => this.router.navigate(['/forgot-password']), 3000);
          return;
        }
        
        this.startExpirationTimer();
      })
    );
  }

  async verifyOtp() {
    if (this.isLoading) return;

    const otpCode = Object.values(this.otpData).join('').toUpperCase();
    const validationError = this.validateOtp(otpCode);

    if (validationError) {
      this.showMessage(validationError, 'error');
      this.shakeInputs();
      return;
    }

    this.isLoading = true;

    try {
      await this.handleSuccessfulVerification(otpCode);
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
    if (!/^[A-Z][0-9]{6}$/.test(otpCode)) {
      return 'Invalid verification code format.';
    }
    return null;
  }

  private async handleSuccessfulVerification(otpCode: string) {
    try {
      const verifyRequest: OtpVerifyRequest = {
        email: this.email,
        otpCode: otpCode,
        type: 'password_reset'
      };

      const response = await firstValueFrom(
        this.authService.verifyOtp(verifyRequest)
      );

      if (!response.success) {
        throw new Error(response.message || 'OTP verification failed');
      }

      sessionStorage.setItem('resetEmail', this.email);
      sessionStorage.setItem('resetOtp', otpCode);
      sessionStorage.setItem('otpVerified', 'true');
      
      this.showMessage('Verification successful! Redirecting...', 'success');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.router.navigate(['/reset-password']);
      
    } catch (error) {
      throw error;
    }
  }

  private handleVerificationError(error: any) {
    const errorMsg = (error.message || '').toLowerCase();
    
    if (errorMsg.includes('expired')) {
      this.showMessage('Code has expired. Please request a new one.', 'error');
      this.canResend = true;
      this.isExpired = true;
    } else if (errorMsg.includes('invalid')) {
      this.showMessage('Invalid code. Please check and try again.', 'error');
    } else if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
      this.showMessage('Account not found. Please check your email.', 'error');
    } else {
      this.showMessage(error.message || 'Verification failed. Please try again.', 'error');
    }
  }

  async resendOtp() {
    if (!this.canResend || this.isLoading || this.isResending) return;
    
    this.isResending = true;

    try {
      const resendRequest: OtpRequest = {
        email: this.email,
        type: 'password_reset'
      };

      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));

      if (response.success) {
        this.showMessage('New code sent! Check your email.', 'success');
        this.startResendTimer();
        this.startExpirationTimer();
        this.clearOtpInputs();
        this.isExpired = false;
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to resend code. Please try again.';
      if (errorMsg.includes('already verified')) {
        this.showMessage('A new code has been sent to your email.', 'success');
        this.startResendTimer();
        this.startExpirationTimer();
        this.clearOtpInputs();
        this.isExpired = false;
      } else {
        this.showMessage(errorMsg, 'error');
      }
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

  private startExpirationTimer() {
    this.expirationTimer = 600;
    this.isExpired = false;
    
    this.clearExpirationTimer();
    this.expirationTimerInterval = setInterval(() => {
      this.expirationTimer--;
      if (this.expirationTimer <= 0) {
        this.clearExpirationTimer();
        this.isExpired = true;
        this.showMessage('Verification code has expired. Please request a new one.', 'error');
      }
    }, 1000);
  }

  private clearResendTimer() {
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
      this.resendTimerInterval = null;
    }
  }

  private clearExpirationTimer() {
    if (this.expirationTimerInterval) {
      clearInterval(this.expirationTimerInterval);
      this.expirationTimerInterval = null;
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
    this.router.navigate(['/forgot-password']);
  }

  getResendText(): string {
    if (this.isResending) return 'Sending...';
    return this.canResend ? 'Resend Code' : `Resend in ${this.resendTimer}s`;
  }

  getExpirationTime(): string {
    const minutes = Math.floor(this.expirationTimer / 60);
    const seconds = this.expirationTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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