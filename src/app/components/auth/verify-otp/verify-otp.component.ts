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
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  otpData = {
    digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: '', digit7: ''
  };

  isLoading = false;
  isResending = false;
  resendTimer = 0;
  canResend = true;

  email = '';
  verificationType: 'email_verification' | 'password_reset' | '2fa' | 'phone_verification' = 'email_verification';
  userType = ''; 

  pageTitle = 'Verify Your Account';
  infoText = 'We\'ve sent a 7-character verification code to your email';

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
        
        this.userType = params['userType'] || params['usertype'] || params['role'] || params['user_type'] || '';
        
        console.log('OTP Component - User Type:', this.userType);
        console.log('OTP Component - Email:', this.email);
        console.log('OTP Component - Verification Type:', this.verificationType);
        console.log('All query params:', params);

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
    const userTypeDisplay = this.getUserTypeDisplay();
    
    switch (this.verificationType) {
      case 'email_verification':
        this.pageTitle = `Verify Your ${userTypeDisplay} Account`;
        this.infoText = `We've sent a 7-character code to complete your ${userTypeDisplay.toLowerCase()} registration`;
        break;
      case 'password_reset':
        this.pageTitle = 'Reset Password Verification';
        this.infoText = 'Enter the 7-character code sent to your email to reset your password';
        break;
      default:
        this.pageTitle = 'Verify Your Account';
        this.infoText = 'Enter the 7-character verification code';
    }
  }

  private getUserTypeDisplay(): string {
    if (!this.userType) return 'User';
    
    const normalized = this.userType.toLowerCase().trim();
    const displayMap: { [key: string]: string } = {
      'landlord': 'Landlord',
      'tenant': 'Tenant',
      'caretaker': 'Caretaker',
      'business': 'Business',
      'admin': 'Admin',
    };
    
    return displayMap[normalized] || this.userType.charAt(0).toUpperCase() + this.userType.slice(1);
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
    console.log('Verification successful - User Type:', this.userType);
    console.log('Verification Type:', this.verificationType);
    console.log('API Response:', response);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (this.verificationType === 'password_reset') {
        sessionStorage.setItem('resetEmail', this.email);
        sessionStorage.setItem('otpVerified', 'true');
        console.log('Navigating to reset-password with email:', this.email);
        this.router.navigate(['/reset-password'], { 
          queryParams: { email: this.email } 
        });
      } else if (this.verificationType === 'email_verification') {
        await this.handleEmailVerificationSuccess(response);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      this.showMessage('Navigation failed. Please login manually.', 'error');
      this.router.navigate(['/login']);
    }
  }

  private async handleEmailVerificationSuccess(response: any) {
    let finalUserType = this.userType;
    
    if (!finalUserType && response.user?.role) {
      finalUserType = response.user.role;
    }
    
    if (!finalUserType && response.role) {
      finalUserType = response.role;
    }

    console.log('Final user type for dashboard:', finalUserType);

    if (!finalUserType) {
      console.error('No user type found for dashboard navigation');
      this.showMessage('User type not found. Please login manually.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    // Check if we have authentication data in the response
    const hasAuthData = response.token || response.user;
    
    if (!hasAuthData) {
      console.log('No authentication data in response - redirecting to login');
      this.showMessage('Email verified successfully! Please login to continue.', 'success');
      
      // Store verification success in session storage for login page
      sessionStorage.setItem('emailVerified', 'true');
      sessionStorage.setItem('verifiedEmail', this.email);
      sessionStorage.setItem('verifiedUserType', finalUserType);
      
      this.router.navigate(['/login'], {
        queryParams: {
          email: this.email,
          userType: finalUserType,
          message: 'Email verified successfully! Please login.'
        }
      });
      return;
    }

    // If we have auth data, proceed with auto-login
    const userData = {
      email: this.email,
      userType: finalUserType,
      isVerified: true,
      ...response.user
    };
    
    // Store authentication data
    if (response.token) {
      sessionStorage.setItem('authToken', response.token);
      localStorage.setItem('authToken', response.token); // Also store in localStorage
    }
    
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    sessionStorage.setItem('isAuthenticated', 'true');
    
    // Also store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    console.log('Stored user data:', userData);
    console.log('Auth token stored:', !!response.token);

    const dashboardRoute = this.getDashboardRoute(finalUserType);
    console.log('Attempting to navigate to dashboard:', dashboardRoute);

    this.router.navigate([dashboardRoute]).then(success => {
      if (success) {
        console.log('Successfully navigated to:', dashboardRoute);
      } else {
        console.error('Failed to navigate to dashboard:', dashboardRoute);
        this.tryAlternativeNavigation(finalUserType);
      }
    }).catch(error => {
      console.error('Navigation error:', error);
      this.tryAlternativeNavigation(finalUserType);
    });
  }

  private getDashboardRoute(userType: string): string {
    const normalizedUserType = userType.toLowerCase().trim();
    
    console.log('Determining dashboard route for user type:', normalizedUserType, 'Original:', userType);

    const routeMap: { [key: string]: string } = {
      'landlord': '/landlord-dashboard/home',
      'tenant': '/tenant-dashboard/dashboard', 
      'caretaker': '/caretaker-dashboard',
      'business': '/business-dashboard',
      'admin': '/admin-dashboard',
    };

    const route = routeMap[normalizedUserType] || '/tenant-dashboard/dashboard';
    
    console.log('Selected route:', route);
    return route;
  }

  private tryAlternativeNavigation(userType: string) {
    const normalizedUserType = userType.toLowerCase().trim();
    
    console.log('Trying alternative navigation for:', normalizedUserType);

    if (normalizedUserType === 'landlord' || normalizedUserType === 'property_owner' || normalizedUserType === 'property owner') {
      console.log('Trying alternative landlord navigation...');
      const landlordRoutes = [
        '/landlord-dashboard',
        '/landlord-dashboard/home',
        '/landlord'
      ];
      
      this.tryMultipleRoutes(landlordRoutes, 'Landlord dashboard');
      
    } else if (normalizedUserType === 'tenant' || normalizedUserType === 'renter') {
      console.log('Trying alternative tenant navigation...');
      const tenantRoutes = [
        '/tenant-dashboard',
        '/tenant-dashboard/dashboard',
        '/tenant',
        '/dashboard'
      ];
      
      this.tryMultipleRoutes(tenantRoutes, 'Tenant dashboard');
      
    } else {
      console.log('Trying generic dashboard navigation...');
      const genericRoutes = [
        '/dashboard',
        '/tenant-dashboard/dashboard',
        '/login'
      ];
      
      this.tryMultipleRoutes(genericRoutes, 'Generic dashboard');
    }
  }

  private tryMultipleRoutes(routes: string[], routeType: string) {
    let currentIndex = 0;
    
    const tryNextRoute = () => {
      if (currentIndex >= routes.length) {
        this.showMessage(`${routeType} not available. Redirecting to login.`, 'info');
        this.router.navigate(['/login']);
        return;
      }
      
      const route = routes[currentIndex];
      console.log(`Trying route ${currentIndex + 1}/${routes.length}:`, route);
      
      this.router.navigate([route]).then(success => {
        if (success) {
          console.log(`Successfully navigated to ${routeType} via:`, route);
        } else {
          console.log(`Failed to navigate to:`, route);
          currentIndex++;
          tryNextRoute();
        }
      }).catch(error => {
        console.error(`Error navigating to ${route}:`, error);
        currentIndex++;
        tryNextRoute();
      });
    };
    
    tryNextRoute();
  }

  private handleVerificationError(error: any) {
    const errorMsg = (error.message || '').toLowerCase();
    
    if (errorMsg.includes('expired')) {
      this.showMessage('Code has expired. Please request a new one.', 'error');
      this.canResend = true;
    } else if (errorMsg.includes('invalid')) {
      this.showMessage('Invalid code. Please check and try again.', 'error');
    } else if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
      this.showMessage('Account not found. Please check your email or register.', 'error');
    } else if (errorMsg.includes('already verified')) {
      this.showMessage('Account already verified. Please login.', 'info');
      this.router.navigate(['/login']);
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