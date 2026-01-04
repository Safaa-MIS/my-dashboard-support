import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@my-dashboard-support/data-access';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Always verify with backend on first load or if status unknown
    if (authService.isLoggedIn() === null) {
      const isAuthenticated = await authService.checkAuthStatus();
      
      if (!isAuthenticated) {
        return router.parseUrl('/login');
      }
    }
    
    // Double-check the status after checkAuthStatus completes
    if (!authService.isLoggedIn()) {
      return router.parseUrl('/login');
    }
    
    return true;
    
  } catch (error) {
    console.error('Auth guard error:', error);
    // On error, redirect to login for security
    return router.parseUrl('/login');
  }
};