import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@my-dashboard-support/data-access';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If we don't know the status yet (null),go to check it
  if (authService.isLoggedIn() === null) {
    await authService.checkAuthStatus();
  }
  return authService.isLoggedIn() ? true : router.parseUrl('/login');

};
