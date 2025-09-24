import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('🚀 Starting Angular bootstrap...');

// Force disable hydration
const config = {
  ...appConfig,
  providers: [
    ...appConfig.providers
    // Explicitly no hydration providers
  ]
};

bootstrapApplication(App, config)
  .then(() => {
    console.log('✅ Angular bootstrapped successfully!');
    console.log('🏠 App component should be rendering now...');
  })
  .catch((err) => {
    console.error('❌ Bootstrap FAILED:');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
  });