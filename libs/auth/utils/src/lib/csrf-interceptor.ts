import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfTokenService } from '@my-dashboard-support/auth/data-access';
import { switchMap, catchError, throwError, timeout } from 'rxjs';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfTokenService);
  
  const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  if (!needsCsrf) {
    return next(req);
  }

  return csrfService.getToken().pipe(
    timeout(5000), // Timeout after 5s
    switchMap(token => {
      if (!token) {
        // Fail fast if no token
        return throwError(() => new HttpErrorResponse({
          error: 'CSRF token unavailable',
          status: 403,
          statusText: 'Forbidden'
        }));
      }

      const clonedReq = req.clone({
        setHeaders: { 'X-CSRF-TOKEN': token }
      });
      
      return next(clonedReq);
    }),
    catchError(error => {
      console.error('CSRF interceptor error:', error);
      return throwError(() => error);
    })
  );
};