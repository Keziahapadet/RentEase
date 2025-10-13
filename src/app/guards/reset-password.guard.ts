import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const resetPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const email = sessionStorage.getItem('resetEmail');
  const otpCode = sessionStorage.getItem('resetOtp');
  const otpVerified = sessionStorage.getItem('otpVerified');
  

  console.log('Reset Password Guard Check:', {
    email: email ? 'exists' : 'missing',
    otpCode: otpCode ? 'exists' : 'missing',
    otpVerified: otpVerified,
    allValid: !!(email && otpCode && otpVerified === 'true')
  });

  if (email && otpCode && otpVerified === 'true') {
    return true;
  }
  sessionStorage.removeItem('resetEmail');
  sessionStorage.removeItem('resetOtp');
  sessionStorage.removeItem('otpVerified');
  
  console.warn('Access denied to reset-password. Redirecting to forgot-password.');
  
  router.navigate(['/forgot-password'], {
    queryParams: { 
      error: 'session_expired',
      message: 'Please verify your OTP first' 
    }
  });
  
  return false;
};