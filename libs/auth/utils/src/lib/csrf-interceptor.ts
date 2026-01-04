import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfTokenService } from '@my-dashboard-support/data-access';
import { switchMap, catchError, of } from 'rxjs';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfTokenService);

  // Only add CSRF token for state-changing operations
  const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  if (!needsCsrf) {
    return next(req);
  }

  // Get CSRF token (will fetch if not cached)
  return csrfService.getToken().pipe(
    switchMap(token => {
      const clonedReq = req.clone({
        setHeaders: token ? { 'X-CSRF-TOKEN': token } : {}
      });
      return next(clonedReq);
    }),
    catchError(error => {
      console.error('CSRF token error:', error);
      return next(req); // Continue without token if fetch fails
    })
  );
};
