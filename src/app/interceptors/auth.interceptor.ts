import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const skipAuth = [
    '/auth/login',
    '/auth/signup', 
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/forgot-password',
    '/auth/verify-reset-otp',
    '/auth/reset-password',
    '/auth/resend-otp'
  ].some(endpoint => req.url.includes(endpoint));

  if (skipAuth) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Adding auth token to request:', req.url);
    
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('🔴 401 Unauthorized - clearing corrupted storage and redirecting to login');
          authService.clearCorruptedStorage();
          
          // Redirect to login page with a return URL
          const currentUrl = router.url;
          if (!currentUrl.includes('/auth/login')) {
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: currentUrl }
            });
          }
        }
        
        return throwError(() => error);
      })
    );
  } else {
    // No token found - redirect to login
    console.log('🔴 No auth token found - redirecting to login');
    const currentUrl = router.url;
    if (!currentUrl.includes('/auth/login')) {
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: currentUrl }
      });
    }
  }
  
  return next(req);
};