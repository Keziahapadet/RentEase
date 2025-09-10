import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { VerifyOtpComponent } from './components/auth/veryfy-otp/verify-otp.component'; 
import { TenantDashboardComponent } from './components/dashboard/tenant-dashboard/tenant-dashboard.component';
import { LoginComponent } from './components/auth/login/login';
import { LandlordDashboardComponent } from './components/dashboard/landlord-dashboard/landlord-dashboard'
import { FeaturesComponent } from '../pages/features/features';
import { PricingComponent } from '../pages/pricing/pricing';
import { ContactComponent } from '../pages/contacts/contacts';
import { TermsComponent } from '../pages/terms/terms';
import { PrivacyComponent } from '../pages/privacy/privacy';
import { AboutComponent } from '../pages/about/about';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password';


export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent, 
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
    component: LandlordDashboardComponent 
  },
  { path: 'landlord', redirectTo: '/landlord-dashboard' },

   { path: 'login', 
    component: LoginComponent 
  }, 
  
   { path: 'forgot-password', 
    component: ForgotPasswordComponent 
  },
  { 
    path: 'dashboard',                  
    redirectTo: '/tenant-dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'features', 
    component: FeaturesComponent 
  },
  { 
    path: 'pricing', 
    component: PricingComponent 
  },
  { 
    path: 'contact', 
    component: ContactComponent
  },
  { 
    path: 'about', 
    component: AboutComponent
  },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { 
    path: '**', 
    redirectTo: '' 
  }
];