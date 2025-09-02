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
      this.role = params['role'] || 'tenant';
      console.log('Route params:', { phone: this.phone, email: this.email, role: this.role });
    });
  }

  async verifyOtp() {
    const enteredOtp = this.otp.join('');
    
    if (enteredOtp.length !== 6) {
      alert('Enter all 6 digits');
      return;
    }

    this.isLoading = true;

    try {
      // Simulate OTP verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isLoading = false;
      this.isVerified = true;

      // Add console log for debugging
      console.log('OTP verified, attempting navigation...');

      // Small delay before redirect
      setTimeout(async () => {
        try {
          // Navigate based on role, with fallback
          const targetRoute = this.role === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard';
          console.log('Navigating to:', targetRoute);
          
          const navigationResult = await this.router.navigate([targetRoute]);
          
          if (navigationResult) {
            console.log('Navigation successful');
          } else {
            console.error('Navigation failed');
            // Fallback navigation
            this.router.navigateByUrl('/tenant-dashboard');
          }
        } catch (error) {
          console.error('Navigation error:', error);
          // Alternative approach using navigateByUrl
          try {
            await this.router.navigateByUrl('/tenant-dashboard');
          } catch (urlError) {
            console.error('URL navigation also failed:', urlError);
            // Last resort - reload page with new URL
            window.location.href = '/tenant-dashboard';
          }
        }
      }, 1000);

    } catch (error) {
      console.error('OTP verification error:', error);
      this.isLoading = false;
      alert('Verification failed. Please try again.');
    }
  }

  resendOtp() {
    console.log('Resending OTP for:', this.phone || this.email);
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

  // Handle backspace navigation
  onKeyDown(event: any, index: number) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prevInput = document.querySelector<HTMLInputElement>(`input[name=otp${index}]`);
      prevInput?.focus();
    }
  }
}