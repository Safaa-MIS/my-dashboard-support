import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@my-dashboard-support/auth/data-access';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = authService.isLoggedIn(); 
console.log('NoAuthGuard - isLoggedIn:', isLoggedIn);
  if (isLoggedIn === true) {
    return router.parseUrl('/applications');
  }

  // Allow access to login if not logged in or status unknown
  return true;
};