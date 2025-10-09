import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🔐 AuthRedirectGuard checking authentication...');
  
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    console.log('✅ User is authenticated, redirecting to dashboard');
    const user = authService.getCurrentUser();
    
    if (user?.role) {
      const roleMap: { [key: string]: string } = {
        'LANDLORD': '/landlord-dashboard/home',
        'TENANT': '/tenant-dashboard/home',
        'BUSINESS': '/business-dashboard/home',
        'CARETAKER': '/caretaker-dashboard/home',
        'ADMIN': '/admin-dashboard/home'
      };
      const dashboardRoute = roleMap[user.role.toUpperCase()] || '/dashboard';
      console.log(`🔄 Redirecting ${user.role} to: ${dashboardRoute}`);
      router.navigate([dashboardRoute]);
    } else {
      console.log('🔄 Redirecting to default dashboard');
      router.navigate(['/dashboard']);
    }
    return false; // Block access to auth pages
  }
  
  console.log('✅ User is NOT authenticated, allowing access to auth pages');
  return true; // Allow access to auth pages
};