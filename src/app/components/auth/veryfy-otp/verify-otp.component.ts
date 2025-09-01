import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {
  otp: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isVerified = false;
  phone = '';
  email = '';
  role = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    // Get query params (phone, email, role)
    this.route.queryParams.subscribe(params => {
      this.phone = params['phone'] || '';
      this.email = params['email'] || '';
      this.role = params['role'] || 'tenant'; // default to tenant if not provided
    });
  }

  verifyOtp() {
    const enteredOtp = this.otp.join('');
    
    if (enteredOtp.length !== 6) {
      alert('Enter all 6 digits');
      return;
    }

    this.isLoading = true;

    // Simulate OTP verification delay
    setTimeout(() => {
      this.isLoading = false;
      this.isVerified = true;

      // Small delay before redirect
      setTimeout(() => {
        // Navigate to tenant dashboard directly
        this.router.navigate(['/tenant-dashboard']);
      }, 1000);

    }, 1000);
  }

  resendOtp() {
    alert('OTP resent successfully!');
  }

  // Automatically move to next input after typing a digit
  autoMove(event: any, index: number) {
    const input = event.target;
    if (input.value && index < 5) {
      const nextInput = document.querySelector<HTMLInputElement>(`input[name=otp${index+2}]`);
      nextInput?.focus();
    }
  }
}
