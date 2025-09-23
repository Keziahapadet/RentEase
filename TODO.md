# Fix SCSS Undefined Variables

## Tasks
- [ ] Delete src/Global.scss to avoid duplication
- [ ] Update angular.json to use src/global.scss
- [ ] Fix @import syntax in all component SCSS files (19 files)
- [ ] Fix wrong path in invoices.scss
- [ ] Test build to ensure no errors

## Files to Fix
1. src/pages/terms/terms.scss
2. src/pages/privacy/privacy.scss
3. src/pages/pricing/pricing.scss
4. src/pages/home/home.scss
5. src/pages/features/features.scss
6. src/pages/contacts/contacts.scss
7. src/pages/about/about.scss
8. src/app/components/dashboard/tenant/payments/payments.component.scss
9. src/app/components/dashboard/tenant/maintenance/maintenance.component.scss
10. src/app/components/dashboard/tenant/documents/documents.component.scss
11. src/app/components/dashboard/tenant/deposit/deposit.component.scss
12. src/app/components/dashboard/tenant/dashboard-overview/dashboard-overview.component.scss
13. src/app/components/dashboard/landlord/landlord-dashboard/property/property.component.scss
14. src/app/components/dashboard/landlord/landlord-dashboard/property/property-create/property-create.scss
15. src/app/components/dashboard/landlord/landlord-dashboard/financials/invoices/invoices.scss (fix path)
16. src/app/components/auth/verify-otp/verify-otp.component.scss
17. src/app/components/auth/registration/registration.component.scss
18. src/app/components/auth/login/login.component.scss
19. src/app/components/auth/forgot-password/forgot-password.scss
