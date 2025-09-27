import {
  Component, ViewChildren, QueryList, ElementRef,
  AfterViewInit, OnInit, OnDestroy
} from '@angular/core';
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
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss']
})
export class VerifyOtpComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  
  otpData = {
    digit1: '', digit2: '', digit3: '', digit4: '',
    digit5: '', digit6: '', digit7: ''
  };


  isLoading = false;
  resendTimer = 0;
  canResend = true;

 
  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';
  userType: 'landlord' | 'tenant' = 'tenant';


  pageTitle = 'Verify Your Account';
  infoText = 'We\'ve sent a 7-character verification code to your email';

  private subscription = new Subscription();
  private resendTimerInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.initializeComponent();
  }

  ngAfterViewInit() {
    setTimeout(() => this.otpInputs.first?.nativeElement.focus(), 100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.clearResendTimer();
  }


  private initializeComponent() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.verificationType = params['type'] || 'email_verification';
      this.userType = params['userType'] || 'tenant';

      if (!this.email) {
        this.showMessage('No email address found. Please start again.', 'error');
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      this.updateUIBasedOnType();
    });
  }

  private updateUIBasedOnType() {
    switch (this.verificationType) {
      case 'email_verification':
        this.pageTitle = this.userType === 'landlord'
          ? 'Verify Your Landlord Account'
          : 'Verify Your Tenant Account';
        this.infoText = `We've sent a 7-character verification code to your email to complete your ${this.userType} registration`;
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

  
  async verifyOtp() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const otpCode = Object.values(this.otpData).join('').toUpperCase().trim();

      const validationError = this.validateOtp(otpCode);
      if (validationError) {
        this.showMessage(validationError, 'error');
        this.shakeInputs();
        return;
      }

      const verifyRequest: OtpVerifyRequest = { email: this.email, otpCode, type: this.verificationType };
      const response = await firstValueFrom(this.authService.verifyOtp(verifyRequest));

      if (response.success) {
        this.showMessage(response.message || 'Verification successful 🎉', 'success');
        await this.handleSuccessfulVerification();
      } else {
        this.showMessage(response.message || 'Verification failed. Please check your code.', 'error');
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
      case '2fa':
        setTimeout(() => {
          this.router.navigate([this.userType === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard']);
        }, redirectDelay);
        break;
      case 'password_reset':
        sessionStorage.setItem('resetEmail', this.email);
        setTimeout(() => this.router.navigate(['/reset-password']), redirectDelay);
        break;
      case 'phone_verification':
        setTimeout(() => this.router.navigate(['/profile']), redirectDelay);
        break;
      default:
        setTimeout(() => {
          this.router.navigate([this.userType === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard']);
        }, redirectDelay);
    }
  }

  private handleVerificationError(error: any) {
    if (error.message?.includes('expired')) {
      this.showMessage('Verification code has expired. Please request a new one.', 'error');
      this.canResend = true;
    } else if (error.message?.includes('invalid') || error.message?.includes('incorrect')) {
      this.showMessage('Invalid verification code. Please try again.', 'error');
    } else if (error.message?.includes('attempts')) {
      this.showMessage('Too many failed attempts. Please request a new code.', 'error');
      this.canResend = true;
    } else {
      this.showMessage(error.message || 'Verification failed. Please try again.', 'error');
    }
  }

 
  async resendOtp() {
    if (!this.canResend || this.isLoading) return;
    this.isLoading = true;

    try {
      const resendRequest: OtpRequest = { email: this.email, type: this.verificationType };
      const response = await firstValueFrom(this.authService.resendOtp(resendRequest));

      if (response.success) {
        this.showMessage(response.message || 'New verification code sent to your email!', 'info');
        this.startResendTimer();
        this.clearOtpInputs();
      } else {
        this.showMessage(response.message || 'Failed to resend verification code.', 'error');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      this.showMessage(error.message || 'Failed to resend verification code.', 'error');
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

  onDigitInput(event: any, position: number) {
    const input = event.target;
    let value = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    this.otpData[digitKey] = value.slice(-1);

    if (value && position < 7) this.otpInputs.toArray()[position]?.nativeElement.focus();
    if (this.isOtpComplete() && !this.isLoading) setTimeout(() => this.verifyOtp(), 300);
  }

  onKeyDown(event: KeyboardEvent, position: number) {
    const digitKey = `digit${position}` as keyof typeof this.otpData;
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.otpData[digitKey]) this.otpData[digitKey] = '';
      else if (position > 1) {
        const prevDigitKey = `digit${position - 1}` as keyof typeof this.otpData;
        this.otpData[prevDigitKey] = '';
        this.otpInputs.toArray()[position - 2]?.nativeElement.focus();
      }
    } else if (event.key === 'ArrowLeft' && position > 1) {
      this.otpInputs.toArray()[position - 2]?.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && position < 7) {
      this.otpInputs.toArray()[position]?.nativeElement.focus();
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
        for (let i = 0; i < cleanText.length; i++) {
          const digitKey = `digit${i + 1}` as keyof typeof this.otpData;
          this.otpData[digitKey] = cleanText[i];
        }
        if (cleanText.length === 7) {
          this.otpInputs.toArray()[6]?.nativeElement.focus();
          setTimeout(() => { if (this.isOtpComplete() && !this.isLoading) this.verifyOtp(); }, 300);
        } else {
          this.otpInputs.toArray()[cleanText.length]?.nativeElement.focus();
        }
      }
    }).catch(err => console.warn('Failed to read clipboard:', err));
  }

  isOtpComplete(): boolean {
    return Object.values(this.otpData).every(digit => digit.length === 1);
  }

  private clearOtpInputs() {
    Object.keys(this.otpData).forEach(key => (this.otpData as any)[key] = '');
    setTimeout(() => this.otpInputs.first?.nativeElement.focus(), 100);
  }

  private shakeInputs() {
    const inputContainer = document.querySelector('.otp-inputs');
    if (inputContainer) {
      inputContainer.classList.add('shake');
      setTimeout(() => inputContainer.classList.remove('shake'), 500);
    }
  }


  goBack() {
    this.router.navigate([this.verificationType === 'password_reset' ? '/forgot-password' : '/login']);
  }

  getResendText(): string {
    return this.canResend ? 'Resend Code' : `Resend code in ${this.resendTimer}s`;
  }

  getDisplayEmail(): string {
    if (!this.email) return '';
    const [localPart, domain] = this.email.split('@');
    if (!domain) return this.email;
    const maskedLocal = localPart.length <= 3
      ? localPart
      : localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
    return `${maskedLocal}@${domain}`;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }
}
