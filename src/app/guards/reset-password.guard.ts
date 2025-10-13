import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const resetPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  try {
    const email = sessionStorage.getItem('resetEmail');
    const otpCode = sessionStorage.getItem('resetOtp');
    const otpVerified = sessionStorage.getItem('otpVerified');
    const hasQueryParams = route.queryParams && Object.keys(route.queryParams).length > 0;
    
    const isValid = 
      email !== null && 
      email !== '' && 
      otpCode !== null && 
      otpCode !== '' && 
      otpVerified === 'true' &&
      !hasQueryParams;
    
    if (isValid) {
      return true;
    }
    
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('resetOtp');
    sessionStorage.removeItem('otpVerified');
    
    router.navigate(['/forgot-password'], {
      queryParams: { 
        error: 'session_invalid',
        message: 'Please complete the password reset process from the beginning'
      },
      replaceUrl: true
    });
    
    return false;
    
  } catch (error) {
    router.navigate(['/forgot-password']);
    return false;
  }
};