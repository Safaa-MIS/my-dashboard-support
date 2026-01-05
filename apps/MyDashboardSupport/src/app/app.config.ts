import {  ApplicationConfig,  ErrorHandler,  provideBrowserGlobalErrorListeners} from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import { appRoutes } from './app.routes';
import {jwtInterceptor,csrfInterceptor} from '@my-dashboard-support/utils';
import {errorInterceptor} from '@my-dashboard-support/shared/data-access-http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';

import { APP_CONFIG , LowerCaseUrlSerializer} from '@my-dashboard-support/util-config';
import { GlobalErrorHandler } from '@my-dashboard-support/shared/util-logging';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(),
     provideRouter(appRoutes),
      provideHttpClient(
      withInterceptors([ 
         csrfInterceptor,  //CSRF interceptor FIRST
      jwtInterceptor,
    errorInterceptor])
    ),
  
    { provide: APP_CONFIG, useValue: environment },
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
};
