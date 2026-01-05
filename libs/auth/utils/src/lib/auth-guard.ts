import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@my-dashboard-support/auth/data-access';
import { map, catchError, of } from 'rxjs';
import { ROUTES } from '@my-dashboard-support/shared/domain';

/**
 * Auth Guard - Protects routes that require authentication
 * 
 *   FIXED: Properly handles Observable from checkAuthStatus()
 *   Returns Observable<boolean | UrlTree> for async guard support
 *   Uses constants for routes
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get current logged-in status
  const currentStatus = authService.isLoggedIn();

  // If already confirmed logged in, allow immediately
  if (currentStatus === true) {
    return true;
  }

  // If status unknown or false, check with backend
  // Return Observable for async guard support
  return authService.checkAuthStatus().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        console.log('[AuthGuard] User authenticated, allowing access');
        return true;
      }
      
      console.warn('[AuthGuard] User not authenticated, redirecting to login');
      return router.parseUrl(ROUTES.AUTH.LOGIN);
    }),
    catchError(error => {
      console.error('[AuthGuard] Auth check failed:', error);
      // On error, redirect to login for security
      return of(router.parseUrl(ROUTES.AUTH.LOGIN));
    })
  );
};