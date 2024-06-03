import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient()
  ],
};

export const environment = {
  production: true,
  clinicalTrialBaseUrl: 'https://clinicaltrials.gov/api/',
  clinicalTrialUrlVersion: 'v2/',
  studyResource: 'studies'
}
