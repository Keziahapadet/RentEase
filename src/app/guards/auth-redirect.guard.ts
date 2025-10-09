import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user?.role) {
      const roleMap: { [key: string]: string } = {
        'LANDLORD': '/landlord-dashboard/home',
        'TENANT': '/tenant-dashboard/home',
        'BUSINESS': '/business-dashboard/home',
        'CARETAKER': '/caretaker-dashboard/home',
        'ADMIN': '/admin-dashboard/home'
      };
      router.navigate([roleMap[user.role.toUpperCase()] || '/dashboard']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }
  
  return true;
};