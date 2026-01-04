import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@my-dashboard-support/data-access';

export const noAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

   const isLoggedIn = await authService.checkAuthStatus();

  if (isLoggedIn) {
   // console.log('no guard');
   // console.log(authService.isLoggedIn());
    router.navigate(['/applications']);
    return false;
  }

   // console.log('no guard 33333');
   // console.log(authService.isLoggedIn());
  return true;
};
