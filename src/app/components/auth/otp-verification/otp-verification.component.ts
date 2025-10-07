import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  email: string = '';
  isLoading = false;
  isResending = false;
  canResend = false;
  resendTimer = 60;
  showOtpError = false;
  otpErrorMessage = '';
  
  otpFields = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6', 'otp7'];
  private timerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    const otpControls: { [key: string]: FormControl } = {};
    this.otpFields.forEach(field => {
      otpControls[field] = new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]$/)
      ]);
    });

    this.otpForm = this.fb.group({
      otpFields: this.fb.group(otpControls)
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.navigateToForgotPassword();
      }
    });

    this.startResendTimer();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  private startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;

    this.timerSubscription = interval(1000).subscribe(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  get otpFieldsGroup(): FormGroup {
    return this.otpForm.get('otpFields') as FormGroup;
  }

  isOtpComplete(): boolean {
    const values = this.getOtpValues();
    return values.length === 7 && values.every(char => char !== '');
  }

  getOtpValues(): string[] {
    return this.otpFields.map(field => {
      const value = this.otpFieldsGroup.get(field)?.value;
      return value ? value.toString().toUpperCase() : '';
    });
  }

  getCombinedOtp(): string {
    return this.getOtpValues().join('');
  }

  onOtpInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    if (value && !value.match(/^[A-Za-z0-9]$/)) {
      value = '';
      input.value = '';
    }
    
    if (value) {
      value = value.toUpperCase();
      this.otpFieldsGroup.get(this.otpFields[index])?.setValue(value);
      input.value = value;
      
      if (index < 6) {
        setTimeout(() => {
          const nextInput = document.querySelector(`[formControlName="${this.otpFields[index + 1]}"]`) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }, 10);
      }
    }
    
    this.showOtpError = false;
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const currentInput = event.target as HTMLInputElement;
    
    if (event.key === 'Backspace') {
      if (!currentInput.value && index > 0) {
        event.preventDefault();
        const prevInput = document.querySelector(`[formControlName="${this.otpFields[index - 1]}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          this.otpFieldsGroup.get(this.otpFields[index - 1])?.setValue('');
          prevInput.value = '';
        }
      } else if (currentInput.value) {
        this.otpFieldsGroup.get(this.otpFields[index])?.setValue('');
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = document.querySelector(`[formControlName="${this.otpFields[index - 1]}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    } else if (event.key === 'ArrowRight' && index < 6) {
      event.preventDefault();
      const nextInput = document.querySelector(`[formControlName="${this.otpFields[index + 1]}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    } else if (event.key === 'Tab') {
      return;
    } else if (event.key.length === 1 && !event.key.match(/^[A-Za-z0-9]$/)) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const sanitizedOtp = pastedData.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
    
    if (sanitizedOtp.length > 0) {
      for (let i = 0; i < 7; i++) {
        const value = i < sanitizedOtp.length ? sanitizedOtp[i] : '';
        this.otpFieldsGroup.get(this.otpFields[i])?.setValue(value);
        
        const inputElement = document.querySelector(`[formControlName="${this.otpFields[i]}"]`) as HTMLInputElement;
        if (inputElement) {
          inputElement.value = value;
        }
      }
      
      const focusIndex = Math.min(sanitizedOtp.length, 6);
      const focusInput = document.querySelector(`[formControlName="${this.otpFields[focusIndex]}"]`) as HTMLInputElement;
      if (focusInput) focusInput.focus();
    }
  }

  onSubmit() {
    console.log('Form validity:', this.otpForm.valid);
    console.log('OTP complete:', this.isOtpComplete());
    console.log('OTP values:', this.getOtpValues());
    
    if (!this.isOtpComplete()) {
      this.showOtpError = true;
      this.otpErrorMessage = 'Please enter all 7 characters of the OTP';
      this.snackBar.open(' Please enter all 7 OTP characters', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const otpValue = this.getCombinedOtp();
    
    console.log('Combined OTP:', otpValue);
    
    if (otpValue.length === 7 && otpValue.match(/^[A-Z0-9]+$/)) {
      this.isLoading = true;
      this.showOtpError = false;
      
      const payload = { 
        email: this.email, 
        otp: otpValue 
      };

      console.log(' OTP Payload:', payload);

      setTimeout(() => {
        this.isLoading = false;
        
        this.snackBar.open('OTP verified successfully! Redirecting...', 'Close', {
          duration: 2000,
          panelClass: ['snackbar-success']
        });

        console.log(' Navigating to reset-password with:', { email: this.email, otp: otpValue });

        this.router.navigate(['/reset-password'], {
          queryParams: { 
            email: this.email, 
            otp: otpValue 
          }
        });
      }, 1500);
    } else {
      this.showOtpError = true;
      this.otpErrorMessage = 'OTP must contain only letters and numbers';
      this.snackBar.open(' Invalid OTP format', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  resendOtp() {
    if (!this.canResend) return;

    this.isResending = true;

    this.otpFields.forEach(field => {
      this.otpFieldsGroup.get(field)?.setValue('');
    });
    
    this.otpFields.forEach(field => {
      const inputElement = document.querySelector(`[formControlName="${field}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    });
    
    setTimeout(() => {
      const firstInput = document.querySelector(`[formControlName="otp1"]`) as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);

    setTimeout(() => {
      this.isResending = false;
      this.snackBar.open('New OTP sent to your email!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.startResendTimer();
    }, 1000);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}