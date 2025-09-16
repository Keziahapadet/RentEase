import { Routes, provideRouter, withInMemoryScrolling } from '@angular/router';
import { HomeComponent } from '../pages/home/home';
import { RegistrationComponent } from './components/auth/registration/registration.component'; 
import { TenantDashboardComponent } from './components/dashboard/tenant/tenant-dashboard/tenant-dashboard.component';
import { LoginComponent } from './components/auth/login/login';
import { LandlordDashboardComponent } from './components/dashboard/landlord/landlord-dashboard/landlord-dashboard'
import { FeaturesComponent } from '../pages/features/features';
import { PricingComponent } from '../pages/pricing/pricing';
import { ContactComponent } from '../pages/contacts/contacts';
import { TermsComponent } from '../pages/terms/terms';
import { PrivacyComponent } from '../pages/privacy/privacy';
import { AboutComponent } from '../pages/about/about';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password';

// Import tenant dashboard sub-components
import { DepositComponent } from './components/dashboard/tenant/deposit/deposit.component';
import { PaymentsComponent } from './components/dashboard/tenant/payments/payments.component';
import { MaintenanceComponent } from './components/dashboard/tenant/maintenance/maintenance.component';
import { DocumentsComponent } from './components/dashboard/tenant/documents/documents.component';
import { MessagesComponent } from './components/dashboard/tenant/messages/messages.component';
import { MarketplaceComponent } from './components/dashboard/tenant/marketplace/marketplace.component';
import { ReviewComponent } from './components/dashboard/tenant/review/review.component';
import { SettingsComponent } from './components/dashboard/tenant/settings/settings.component';

// Import landlord dashboard sub-components - USING SINGULAR 'property'
import { FinancialsComponent } from './components/dashboard/landlord/landlord-dashboard/financials/financials';
import { InvoicesComponent } from './components/dashboard/landlord/landlord-dashboard/financials/invoices/invoices';
import { PaymentComponent } from './components/dashboard/landlord/landlord-dashboard/financials/payment/payment';
import { PropertyComponent } from './components/dashboard/landlord/landlord-dashboard/property/property.component';
import { PropertyCreateComponent } from './components/dashboard/landlord/landlord-dashboard/property/property-create/property-create';

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
    path: 'login', 
    component: LoginComponent 
  }, 
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  },
  
  // Tenant Dashboard with child routes
  { 
    path: 'tenant-dashboard',           
    component: TenantDashboardComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TenantDashboardComponent },
      { path: 'deposit', component: DepositComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'marketplace', component: MarketplaceComponent },
      { path: 'reviews', component: ReviewComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }, 
  
  // Landlord Dashboard with nested child routes
  { 
    path: 'landlord-dashboard',         
    component: LandlordDashboardComponent,
    children: [
      // Default redirect to dashboard overview when accessing landlord-dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // Dashboard overview route (shows the main dashboard)
      { path: 'dashboard', component: LandlordDashboardComponent },
      
      // Financials route with its own child routes
      {
        path: 'financials', 
        component: FinancialsComponent,
        children: [
          { path: 'invoices', component: InvoicesComponent },
          { path: 'payments', component: PaymentComponent },
          // { path: 'expenses', component: ExpensesComponent },
          // { path: 'reports', component: ReportsComponent }
        ]
      },
      
      // Property route (SINGULAR) with its own child routes
      {
        path: 'property', 
        component: PropertyComponent,
        children: [
          { path: '', component: PropertyComponent }, // Shows property list
          { path: 'create', component: PropertyCreateComponent }, // Add new property
          // { path: 'edit/:id', component: PropertyEditComponent },
          // { path: ':id', component: PropertyDetailComponent }
        ]
      },
      
      // Add other landlord dashboard routes here
      // { path: 'tenants', component: TenantsComponent },
      // { path: 'maintenance', component: MaintenanceManagementComponent },
      // { path: 'settings', component: LandlordSettingsComponent }
    ]
  },

  { path: 'landlord', redirectTo: '/landlord-dashboard' },
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
  { 
    path: 'terms', 
    component: TermsComponent 
  },
  { 
    path: 'privacy', 
    component: PrivacyComponent 
  },
  
  { 
    path: '**', 
    redirectTo: '/' 
  }
];

export const appRouterProviders = [
  provideRouter(
    routes,
    withInMemoryScrolling({
      scrollPositionRestoration: 'top', 
      anchorScrolling: 'enabled'        
    })
  )
];