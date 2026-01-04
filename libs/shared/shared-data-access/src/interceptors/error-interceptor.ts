import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { ROUTES, MESSAGES } from '@my-dashboard-support/domain';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger-service';

/**
 * @param req 
 **** this trigger only in these cases
   * Backend errors
   * Network failures
   * API validation errors
   * Authentication failures
 * @param next 
 * @returns 
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract meaningful error message
      const message = error.error?.message || getDefaultMessage(error.status);

      // Log error
      logger.error(`HTTP Error ${error.status}`, error, 'ErrorInterceptor', {
        url: req.url,
        method: req.method
      });

      // Handle different error types
      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          router.navigate([ROUTES.AUTH.LOGIN]);
          toast.error(MESSAGES.ERROR.SESSION_EXPIRED);
          break;

        case 403:
          // Forbidden - show error
          router.navigate([ROUTES.ERROR.UNAUTHORIZED]);
          toast.error(MESSAGES.ERROR.UNAUTHORIZED);
          break;

        case 404:
          // Not found - usually handled by component
          toast.error(MESSAGES.ERROR.NOT_FOUND);
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          toast.error(MESSAGES.ERROR.SERVER_ERROR);
          break;

        case 0:
          // Network error (offline)
          toast.error(MESSAGES.ERROR.NETWORK);
          break;

        default:
          // Other errors
          toast.error(message);
      }

      // Rethrow error so services can handle it if needed
      return throwError(() => error);
    })
  );
};

function getDefaultMessage(status: number): string {
  switch (status) {
    case 401: return MESSAGES.ERROR.SESSION_EXPIRED;
    case 403: return MESSAGES.ERROR.UNAUTHORIZED;
    case 404: return MESSAGES.ERROR.NOT_FOUND;
    case 500: return MESSAGES.ERROR.SERVER_ERROR;
    case 0: return MESSAGES.ERROR.NETWORK;
    default: return MESSAGES.ERROR.GENERIC;
  }
}
