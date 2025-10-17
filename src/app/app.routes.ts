import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password';
import { PricingComponent } from '../pages/pricing/pricing';
import { ContactComponent } from '../pages/contacts/contacts';
import { TermsComponent } from '../pages/terms/terms';
import { PrivacyComponent } from '../pages/privacy/privacy';
import { AboutComponent } from '../pages/about/about';
import { TenantDashboardComponent } from './components/dashboard/tenant/tenant-dashboard/tenant-dashboard.component';
import { DepositComponent } from './components/dashboard/tenant/deposit/deposit.component';
import { PaymentsComponent } from './components/dashboard/tenant/payments/payments.component';
import { MaintenanceComponent } from './components/dashboard/tenant/maintenance/maintenance.component';
import { DocumentsComponent } from './components/dashboard/tenant/documents/documents.component';
import { MessagesComponent } from './components/dashboard/tenant/messages/messages.component';
import { ReviewComponent } from './components/dashboard/tenant/review/review.component';
import { SettingsComponent } from './components/dashboard/tenant/settings/settings.component';
import { LandlordDashboardComponent } from './components/dashboard/landlord/landlord-dashboard/landlord-dashboard';
import { FinancialsComponent } from './components/dashboard/landlord/landlord-dashboard/financials/financials';
import { InvoicesComponent } from './components/dashboard/landlord/landlord-dashboard/financials/invoices/invoices';
import { PaymentComponent } from './components/dashboard/landlord/landlord-dashboard/financials/payment/payment';
import { PropertyCreateComponent } from './components/dashboard/landlord/landlord-dashboard/property/property-create/property-create';
import { PropertyListComponent } from './components/dashboard/landlord/landlord-dashboard/property/property-list/property-list.component';
import { PropertyUnitsComponent } from './components/dashboard/landlord/landlord-dashboard/property/property-units/property-units.component';
import { LandlordDashboardHomeComponent } from './components/dashboard/landlord/landlord-dashboard/home/landlord-dashboard-home.component';
import { ProfileViewComponent } from './components/dashboard/landlord/landlord-dashboard/profile/profile-view/profile-view.component';
import { ProfileEditComponent } from './components/dashboard/landlord/landlord-dashboard/profile/profile-edit/profile-edit.component';
import { ResetPasswordOtpComponent } from './components/auth/otp-verificationreset-password/otp-verificationreset-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { resetPasswordGuard } from './guards/reset-password.guard';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './components/dashboard/admin/admin-dashboard/admin-dashboard.component';
import { CaretakerDashboardComponent } from './components/dashboard/caretaker/caretaker-dashboard.component';
import { BusinessDashboardComponent } from './components/dashboard/bussiness/business-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'registration', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'otp-verificationreset-password', component: ResetPasswordOtpComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent,
    canActivate: [resetPasswordGuard] 
  },
  { path: 'pricing', component: PricingComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
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
      { path: 'reviews', component: ReviewComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  {
    path: 'landlord-dashboard',
    component: LandlordDashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: LandlordDashboardHomeComponent },
      { path: 'profile', redirectTo: 'profile/view', pathMatch: 'full' },
      { path: 'profile/view', component: ProfileViewComponent },
      { path: 'profile/edit', component: ProfileEditComponent },
      { path: 'property', redirectTo: 'property/list', pathMatch: 'full' },
      { path: 'property/create', component: PropertyCreateComponent },
      { path: 'property/list', component: PropertyListComponent },
      { path: 'property/:id', redirectTo: 'property/:id/units' },
      { path: 'property/:id/units', component: PropertyUnitsComponent },
      { path: 'property/:propertyId/unit/create', component: PropertyCreateComponent },
      { path: 'financials', component: FinancialsComponent },
      { path: 'financials/invoices', component: InvoicesComponent },
      { path: 'financials/payments', component: PaymentComponent },
      { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'business-dashboard',
    component: BusinessDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: BusinessDashboardComponent },
      { path: 'jobs', component: BusinessDashboardComponent },
      { path: 'earnings', component: BusinessDashboardComponent },
      { path: 'reviews', component: BusinessDashboardComponent },
      { path: 'profile', component: BusinessDashboardComponent },
      { path: 'services', component: BusinessDashboardComponent },
      { path: 'messages', component: BusinessDashboardComponent }
    ]
  },
  {
    path: 'caretaker-dashboard',
    component: CaretakerDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: CaretakerDashboardComponent },
      { path: 'maintenance', component: CaretakerDashboardComponent },
      { path: 'inspections', component: CaretakerDashboardComponent },
      { path: 'properties', component: CaretakerDashboardComponent },
      { path: 'messages', component: CaretakerDashboardComponent },
      { path: 'reports', component: CaretakerDashboardComponent }
    ]
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminDashboardComponent },
      { path: 'businesses', component: AdminDashboardComponent },
      { path: 'users', component: AdminDashboardComponent },
      { path: 'disputes', component: AdminDashboardComponent },
      { path: 'transactions', component: AdminDashboardComponent },
      { path: 'reports', component: AdminDashboardComponent },
      { path: 'settings', component: AdminDashboardComponent }
    ]
  },
  { path: 'landlord', redirectTo: '/landlord-dashboard' },
  { path: 'tenant', redirectTo: '/tenant-dashboard' },
  { path: 'business', redirectTo: '/business-dashboard' },
  { path: 'caretaker', redirectTo: '/caretaker-dashboard' },
  { path: 'admin', redirectTo: '/admin-dashboard' },
  { path: 'dashboard', redirectTo: '/tenant-dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];