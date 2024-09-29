import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { responseInterceptor } from './interceptors/response.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor, responseInterceptor
      ])
    ),
  ]
};
