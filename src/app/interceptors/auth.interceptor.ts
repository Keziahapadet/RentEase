import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const skipAuth = [
    '/login',
    '/signup', 
    '/send-otp',
    '/verify-otp',
    '/forgot-password'
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

    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('401 on', req.url, '- Not clearing token (expected for OTP/auth flows)');
          
          const isOtpEndpoint = req.url.includes('/verify-otp') || 
                               req.url.includes('/send-otp');
          
          if (!isOtpEndpoint) {
            console.log('Clearing auth due to 401 on protected endpoint');
            authService.clearCorruptedStorage();
          }
        }
        
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};