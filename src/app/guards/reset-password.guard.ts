import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const resetPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const email = sessionStorage.getItem('resetEmail');
  const otpVerified = sessionStorage.getItem('otpVerified');
  if (email && otpVerified === 'true') {
    return true;
  } else {
    router.navigate(['/forgot-password']);
    return false;
  }
};