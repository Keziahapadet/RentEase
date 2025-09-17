import { Routes, provideRouter, withInMemoryScrolling } from '@angular/router';
import { HomeComponent } from '../pages/home/home';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { LoginComponent } from './components/auth/login/login.component';
import { TenantDashboardComponent } from './components/dashboard/tenant/tenant-dashboard/tenant-dashboard.component';
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
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';

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
    path: 'verify-otp',
    component: VerifyOtpComponent
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

  // FIXED: Landlord Dashboard with proper nested routing
  {
    path: 'landlord-dashboard',
    component: LandlordDashboardComponent,
    children: [
      // Default redirect - shows dashboard home content
      { path: '', pathMatch: 'full', redirectTo: '' },

      // Financials routes - FLAT structure, no nested children
      { path: 'financials', component: FinancialsComponent },
      { path: 'financials/invoices', component: InvoicesComponent },
      { path: 'financials/payments', component: PaymentComponent },
      // { path: 'financials/expenses', component: ExpensesComponent },

      // Property routes - FLAT structure, no nested children
      { path: 'property', component: PropertyComponent },
      { path: 'property/create', component: PropertyCreateComponent },
      // { path: 'property/edit/:id', component: PropertyEditComponent },
      // { path: 'property/:id', component: PropertyDetailComponent },

      // Add other landlord dashboard routes here as flat routes
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
