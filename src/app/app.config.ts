import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    // Add Zone.js change detection provider
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router + HTTP
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule, MatIconModule),
  ]
};
