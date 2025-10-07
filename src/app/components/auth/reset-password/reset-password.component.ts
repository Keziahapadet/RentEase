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
import { ResetPasswordRequest, ApiResponse } from '../../../services/auth-interfaces';

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
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.otpCode = params['otp'] || '';

      console.log('Reset Password - Raw Email:', this.email);
      console.log('Reset Password - OTP:', this.otpCode);

      // FIXED: Decode URL encoded email
      if (this.email.includes('%40')) {
        this.email = decodeURIComponent(this.email);
        console.log('Reset Password - Decoded Email:', this.email);
      }

      if (!this.email || !this.otpCode) {
        this.showSnackBar('Invalid or expired reset link. Please request a new one.', 'error');
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      return { mismatch: true };
    }
    return null;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < 6) {
      errors['minLength'] = true;
    }

    if (!/(?=.*[a-z])/.test(value)) {
      errors['lowercase'] = true;
    }

    if (!/(?=.*[A-Z])/.test(value)) {
      errors['uppercase'] = true;
    }

    if (!/(?=.*\d)/.test(value)) {
      errors['number'] = true;
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
      errors['specialChar'] = true;
    }

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
    return this.hasMinLength && this.hasUpperCase && this.hasLowerCase &&
           this.hasNumber && this.hasSpecialChar;
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

  onSubmit() {
    if (this.resetForm.invalid || !this.isPasswordValid || !this.passwordsMatch) {
      this.markFormGroupTouched();
      this.showSnackBar('Please fix all validation errors before submitting.', 'error');
      return;
    }

    this.isLoading = true;

    const payload: ResetPasswordRequest = {
      email: this.email, // Now properly decoded
      otpCode: this.otpCode,
      newPassword: this.resetForm.value.newPassword,
      confirmNewPassword: this.resetForm.value.confirmNewPassword
    };

    console.log('Reset Password Payload:', payload);

    this.authService.resetPassword(payload).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        
        if (response.success) {
          this.showSnackBar(
            response.message || 'Password reset successful! Redirecting to login...',
            'success'
          );
          
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: {
                email: this.email,
                message: 'Password reset successfully. Please login with your new password.'
              }
            });
          }, 2000);
        } else {
          this.showSnackBar(response.message || 'Failed to reset password', 'error');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Reset password error:', error);
        
        this.showSnackBar(
          error.error?.message || 
          error.message || 
          'Failed to reset password. Please try again.', 
          'error'
        );
      }
    });
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
    this.router.navigate(['/login']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  get newPasswordControl() {
    return this.resetForm.get('newPassword');
  }

  get confirmNewPasswordControl() {
    return this.resetForm.get('confirmNewPassword');
  }
}