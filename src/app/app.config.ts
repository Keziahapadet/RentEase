import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { authInterceptor } from './interceptors/auth.interceptor'; // 👈 add this

export const appConfig: ApplicationConfig = {
  providers: [
    // Add Zone.js change detection provider
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router
    provideRouter(routes),

    // Http with interceptor
    provideHttpClient(
      withInterceptors([authInterceptor]) // 👈 attach interceptor
    ),

    // Other Angular + Material modules
    importProvidersFrom(FormsModule, MatIconModule),
  ]
};
