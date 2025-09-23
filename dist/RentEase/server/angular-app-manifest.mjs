
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/registration"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/verify-otp"
  },
  {
    "renderMode": 2,
    "route": "/forgot-password"
  },
  {
    "renderMode": 2,
    "redirectTo": "/tenant-dashboard/dashboard",
    "route": "/tenant-dashboard"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/deposit"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/payments"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/maintenance"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/documents"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/messages"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/marketplace"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/reviews"
  },
  {
    "renderMode": 2,
    "route": "/tenant-dashboard/settings"
  },
  {
    "renderMode": 2,
    "redirectTo": "/landlord-dashboard",
    "route": "/landlord-dashboard"
  },
  {
    "renderMode": 2,
    "route": "/landlord-dashboard/financials"
  },
  {
    "renderMode": 2,
    "route": "/landlord-dashboard/financials/invoices"
  },
  {
    "renderMode": 2,
    "route": "/landlord-dashboard/financials/payments"
  },
  {
    "renderMode": 2,
    "route": "/landlord-dashboard/property"
  },
  {
    "renderMode": 2,
    "route": "/landlord-dashboard/property/create"
  },
  {
    "renderMode": 2,
    "redirectTo": "/landlord-dashboard",
    "route": "/landlord"
  },
  {
    "renderMode": 2,
    "redirectTo": "/tenant-dashboard",
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/pricing"
  },
  {
    "renderMode": 2,
    "route": "/contact"
  },
  {
    "renderMode": 2,
    "route": "/about"
  },
  {
    "renderMode": 2,
    "route": "/terms"
  },
  {
    "renderMode": 2,
    "route": "/privacy"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 66116, hash: '96f2754444c4246f1449aad5e7efce590014bad3c08e9c4ae18daa1782f338fa', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2291, hash: '7fdcd430026e61c0cee3a73e3a86cd46485fbe7a39d6e2c8e97ada65689523da', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'forgot-password/index.html': {size: 134046, hash: '9c253a08899b797335a42b1bd8e2e73b8d53b54f531bf81c4aa5a7f0ee929cf2', text: () => import('./assets-chunks/forgot-password_index_html.mjs').then(m => m.default)},
    'registration/index.html': {size: 180324, hash: 'bb4ab713a6697ca7c555f05bee2babc9da10929cd7f3c54dc6e85d2707ad03ab', text: () => import('./assets-chunks/registration_index_html.mjs').then(m => m.default)},
    'index.html': {size: 134102, hash: '946bcb505ba82a922245bc313b8d8b5625a1ee3e608068c5c4869528a1bffed5', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'tenant-dashboard/payments/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_payments_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/documents/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_documents_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/settings/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_settings_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/marketplace/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_marketplace_index_html.mjs').then(m => m.default)},
    'pricing/index.html': {size: 149895, hash: 'da4eadc96af9cf1fb95f6616d3b2d17dc1a40e687e5de3dca4c1e1cffda30c6a', text: () => import('./assets-chunks/pricing_index_html.mjs').then(m => m.default)},
    'about/index.html': {size: 138051, hash: '1d1a978f2a1341aa943c274fa46b54350c4582b48cb5263e0eef2e9ea931da01', text: () => import('./assets-chunks/about_index_html.mjs').then(m => m.default)},
    'landlord-dashboard/financials/invoices/index.html': {size: 302815, hash: '308c3e72ba4351c9b2a89049eee5433232957b3c0b807ab32b402808f4252f26', text: () => import('./assets-chunks/landlord-dashboard_financials_invoices_index_html.mjs').then(m => m.default)},
    'privacy/index.html': {size: 70567, hash: 'c270f55efc3c3ecdf80c87082c6624798ed2dccb82c6812ba5a2850abdcb4f5a', text: () => import('./assets-chunks/privacy_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/deposit/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_deposit_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/messages/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_messages_index_html.mjs').then(m => m.default)},
    'landlord-dashboard/financials/index.html': {size: 205137, hash: '9044bab4e38e01fcac2f5e2fecccd071e4e4371a32ca3c8bea4b881174a72b62', text: () => import('./assets-chunks/landlord-dashboard_financials_index_html.mjs').then(m => m.default)},
    'landlord-dashboard/property/create/index.html': {size: 169635, hash: '62ea630796e18d3dd8641decde8308a578a64ab8fbf470f4bbc61343b4b6c9ce', text: () => import('./assets-chunks/landlord-dashboard_property_create_index_html.mjs').then(m => m.default)},
    'terms/index.html': {size: 71541, hash: 'f4a6095badf4cc99eaf7ad42035766a625be0796cad4bc8e623fe02de130dc6a', text: () => import('./assets-chunks/terms_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/dashboard/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_dashboard_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/reviews/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_reviews_index_html.mjs').then(m => m.default)},
    'verify-otp/index.html': {size: 169218, hash: '14ebfb1630ca30a93437883a13c4bad8dce2d0d652c66a4e0de0f06ec4d92a41', text: () => import('./assets-chunks/verify-otp_index_html.mjs').then(m => m.default)},
    'contact/index.html': {size: 123256, hash: '039b902221cf6292e2c1ea58c5228b9381edfcbac88e3957aec7b72c2651d0ad', text: () => import('./assets-chunks/contact_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 169218, hash: '2bc07b5c1118f002c640bde1015837338798da3ba9a084d37076102df383f499', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'tenant-dashboard/maintenance/index.html': {size: 125069, hash: 'fba05e9cf3ae7d57060e1f12dd483daaecba7d1fe2f7aa9b8dfcb008dd0718cc', text: () => import('./assets-chunks/tenant-dashboard_maintenance_index_html.mjs').then(m => m.default)},
    'landlord-dashboard/financials/payments/index.html': {size: 268492, hash: '7e99e2f0623c6ff2651ba512cbbadeb28871e392129cdcb55362e50fc1de4954', text: () => import('./assets-chunks/landlord-dashboard_financials_payments_index_html.mjs').then(m => m.default)},
    'landlord-dashboard/property/index.html': {size: 113636, hash: '4ede9390b3a020991155e3edfc2ed64a2356e2ff705ad8db94011a4f200aa0b1', text: () => import('./assets-chunks/landlord-dashboard_property_index_html.mjs').then(m => m.default)},
    'styles-RZC3NB7H.css': {size: 139374, hash: '5B6lTAfY/Z0', text: () => import('./assets-chunks/styles-RZC3NB7H_css.mjs').then(m => m.default)}
  },
};
