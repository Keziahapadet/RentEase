import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { VerifyOtpComponent } from './components/auth/veryfy-otp/verify-otp.component'; 
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { LoginComponent } from './components/auth/login/login';
import { LandlordDashboard } from './landlord-dashboard/landlord-dashboard';

export const routes: Routes = [
  { 
    path: '', 
    component: LandingComponent, 
    pathMatch: 'full' 
  },
  { 
    path: 'registration', 
    component: RegistrationComponent 
  },
  { 
    path: 'verify-otp', 
    component: VerifyOtpComponent 
  },
  { 
    path: 'tenant-dashboard',           
    component: TenantDashboardComponent 
  }, 
   { 
    path: 'landlord-dashboard',         
    component: LandlordDashboard 
  },
   { path: 'login', 
    component: LoginComponent 
  }, 
  { 
    path: 'dashboard',                  
    redirectTo: '/tenant-dashboard', 
    pathMatch: 'full' 
  },
  
  { 
    path: '**', 
    redirectTo: '' 
  }
];