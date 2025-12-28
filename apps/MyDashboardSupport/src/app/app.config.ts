import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import { appRoutes } from './app.routes';
import {jwtInterceptor} from '@my-dashboard-support/utils';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';

import { APP_CONFIG , LowerCaseUrlSerializer} from '@my-dashboard-support/util-config';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(),
     provideRouter(appRoutes),
      provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
  
    { provide: APP_CONFIG, useValue: environment },
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer }
  ],
};
