import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { Routes, provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { ApiInterceptor } from '../interceptors/api.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { UniversalInterceptor } from '#interceptors/universal.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // scroll to top after navigating
      // https://fireflysemantics.medium.com/turning-on-scrolltop-restoration-for-the-standalone-angular-router-afd98bd8defd
      // similar to `scrollPositionRestoration` for non-standalone apps
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(),
    // equivalent to `importProvidersFrom(HttpClientModule)`
    provideHttpClient(
      // enable fetch API for ssr
      // https://stackoverflow.com/a/77512684/12577650
      withFetch(),
      // register interceptors
      withInterceptors([ApiInterceptor, UniversalInterceptor]),
    ),
    importProvidersFrom(BrowserAnimationsModule),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // similar to importing `BrowserAnimationModule` to all components
    provideAnimations(),
  ],
};
