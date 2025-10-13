import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ResetPasswordRequest, ApiResponse, LoginRequest, AuthResponse } from '../../../services/auth-interfaces';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  resetForm: FormGroup;
  email: string = '';
  otpCode: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  private routeSub?: Subscription;

  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      confirmNewPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.email = sessionStorage.getItem('resetEmail') || '';
    this.otpCode = sessionStorage.getItem('resetOtp') || '';
    const isOtpVerified = sessionStorage.getItem('otpVerified') === 'true';

    if (!this.email || !this.otpCode || !isOtpVerified) {
      this.showSnackBar('Invalid or expired reset session. Please request a new password reset.', 'error');
      this.clearResetSession();
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.cleanUrl();
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private cleanUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private clearResetSession() {
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('resetOtp');
    sessionStorage.removeItem('otpVerified');
  }

  private clearAllAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('profileImage');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('profileImage');
  }

  validateEmail(email: string): string {
    if (!email.trim()) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.includes('@')) {
      return 'Email needs @ symbol';
    }
    
    if (!email.includes('.')) {
      return 'Email needs .com ';
    }
    
    if (!emailRegex.test(email)) {
      return 'Please check your email format';
    }
    
    return '';
  }

  onPasswordInput(): void {
    this.passwordError = '';
  }

  onConfirmPasswordInput(): void {
    this.confirmPasswordError = '';
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    return newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? { mismatch: true } : null;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const errors: ValidationErrors = {};
    if (value.length < 6) errors['minLength'] = true;
    if (!/(?=.*[a-z])/.test(value)) errors['lowercase'] = true;
    if (!/(?=.*[A-Z])/.test(value)) errors['uppercase'] = true;
    if (!/(?=.*\d)/.test(value)) errors['number'] = true;
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) errors['specialChar'] = true;
    return Object.keys(errors).length ? errors : null;
  }

  get hasMinLength(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return password.length >= 6;
  }

  get hasUpperCase(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /(?=.*[A-Z])/.test(password);
  }

  get hasLowerCase(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /(?=.*[a-z])/.test(password);
  }

  get hasNumber(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /(?=.*\d)/.test(password);
  }

  get hasSpecialChar(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password);
  }

  get passwordsMatch(): boolean {
    const newPassword = this.resetForm.get('newPassword')?.value;
    const confirmNewPassword = this.resetForm.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword && newPassword !== '';
  }

  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasUpperCase && this.hasLowerCase && this.hasNumber && this.hasSpecialChar;
  }

  get passwordStrength(): string {
    let strength = 0;
    if (this.hasMinLength) strength++;
    if (this.hasUpperCase) strength++;
    if (this.hasLowerCase) strength++;
    if (this.hasNumber) strength++;
    if (this.hasSpecialChar) strength++;
    switch (strength) {
      case 0:
      case 1:
        return 'weak';
      case 2:
      case 3:
        return 'medium';
      case 4:
      case 5:
        return 'strong';
      default:
        return 'weak';
    }
  }

  getStrengthPercentage(): number {
    let strength = 0;
    if (this.hasMinLength) strength++;
    if (this.hasUpperCase) strength++;
    if (this.hasLowerCase) strength++;
    if (this.hasNumber) strength++;
    if (this.hasSpecialChar) strength++;
    return (strength / 5) * 100;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  async onSubmit() {
    this.passwordError = '';
    this.confirmPasswordError = '';

    const emailError = this.validateEmail(this.email);
    if (emailError) {
      this.showSnackBar(emailError, 'error');
      return;
    }

    if (this.resetForm.get('newPassword')?.hasError('required')) {
      this.passwordError = 'Password is required';
      this.markFormGroupTouched();
      return;
    }

    if (!this.isPasswordValid) {
      this.passwordError = 'Password does not meet requirements';
      this.markFormGroupTouched();
      return;
    }

    if (this.resetForm.get('confirmNewPassword')?.hasError('required')) {
      this.confirmPasswordError = 'Please confirm your password';
      this.markFormGroupTouched();
      return;
    }

    if (!this.passwordsMatch) {
      this.confirmPasswordError = 'Passwords do not match';
      this.markFormGroupTouched();
      return;
    }

    if (this.resetForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    const payload: ResetPasswordRequest = {
      email: this.email,
      otpCode: this.otpCode,
      newPassword: this.resetForm.value.newPassword
    };

    try {
      const response = await new Promise<ApiResponse>((resolve, reject) => {
        this.authService.resetPassword(payload).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      if (response.success) {
        this.clearResetSession();
        
        this.showSnackBar('Password reset successful! Redirecting to login...', 'success');
        
        await this.performNavigation();
      } else {
        this.isLoading = false;
        this.handleApiError(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      this.isLoading = false;
      this.handleApiError(error);
    }
  }

  private async performNavigation(): Promise<void> {
    try {
      const success = await this.router.navigate(['/login'], {
        queryParams: { 
          email: this.email,
          prefillPassword: this.resetForm.value.newPassword,
          message: 'Password reset successful! Click Login to continue.'
        },
        replaceUrl: true
      });

      if (!success) {
        window.location.href = '/login';
      }
    } catch (err) {
      window.location.href = '/login';
    }
  }

  private handleApiError(error: any): void {
    let errorMessage = 'Failed to reset password. Please try again.';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.error?.message) {
      errorMessage = this.parseBackendError(error.error.message);
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = this.getDetailed400Error(error);
    } else if (error.status === 404) {
      errorMessage = 'Reset password endpoint not found. Please contact support.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    this.showSnackBar(errorMessage, 'error');
  }

  private parseBackendError(message: string): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('otp') && (msg.includes('invalid') || msg.includes('incorrect'))) {
      return 'Invalid or expired OTP code. Please request a new password reset';
    } else if (msg.includes('otp') && msg.includes('expired')) {
      return 'OTP code has expired. Please request a new password reset';
    } else if (msg.includes('password') && msg.includes('same')) {
      this.passwordError = 'Cannot use previous password';
      return 'New password cannot be the same as your old password';
    } else if (msg.includes('password') && msg.includes('weak')) {
      this.passwordError = 'Password too weak';
      return 'Password is too weak. Please use a stronger password';
    } else if (msg.includes('user') && msg.includes('not found')) {
      return 'Account not found. Please check your email address';
    } else if (msg.includes('validation failed')) {
      return 'Invalid request data. Please check your inputs';
    } else {
      return message;
    }
  }

  private getDetailed400Error(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      } else if (error.error.errors) {
        const errors = error.error.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          return errors.map((e: any) => e.defaultMessage || e.message).join(', ');
        }
      } else if (error.error.error) {
        return error.error.error;
      }
    }
    return 'Invalid request. Please check your inputs and try again.';
  }

  private markFormGroupTouched() {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  navigateToLogin() {
    if (!this.isLoading) {
      this.router.navigate(['/login']);
    }
  }

  navigateToForgotPassword() {
    if (!this.isLoading) {
      this.router.navigate(['/forgot-password']);
    }
  }

  get newPasswordControl() {
    return this.resetForm.get('newPassword');
  }

  get confirmNewPasswordControl() {
    return this.resetForm.get('confirmNewPassword');
  }

  get isFormValid(): boolean {
    return this.resetForm.valid && this.isPasswordValid && this.passwordsMatch;
  }
}