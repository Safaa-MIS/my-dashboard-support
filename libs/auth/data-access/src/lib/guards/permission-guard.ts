// libs/auth/data-access/src/lib/guards/permission.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => { 
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get permission(s) from route data
  const singlePermission = route.data['permission'] as string | undefined;
  const multiplePermissions = route.data['permissions'] as string[] | undefined;
  const requireAll = route.data['requireAll'] === true;

  // Check if logged in first (synchronous)
  if (!authService.isLoggedIn()) {
    console.warn('User not logged in, redirecting to login');
    return router.parseUrl('/login');
  }

  if (singlePermission && multiplePermissions) {
    console.error('Route has both permission and permissions defined');
    return router.parseUrl('/unauthorized');
  }

  // Check  permission
  if (singlePermission) {
    const hasPermission = authService.hasPermission(singlePermission);
    
    if (!hasPermission) {
      console.warn(`Permission denied: ${singlePermission}`);
      console.warn('User permissions:', authService.userPermissions());
      return router.parseUrl('/unauthorized');
    }
    
    console.log(`Permission granted: ${singlePermission}`);
    return true;
  }

  // Check multiple permissions
  if (multiplePermissions && multiplePermissions.length > 0) {
    const hasPermissions = requireAll 
      ? authService.hasAllPermissions(multiplePermissions)
      : authService.hasAnyPermission(multiplePermissions);
    
    if (!hasPermissions) {
      const mode = requireAll ? 'ALL' : 'ANY';
      console.warn(`Permissions denied (need ${mode} of):`, multiplePermissions);
      console.warn('User permissions:', authService.userPermissions());
      return router.parseUrl('/unauthorized');
    }
    
    console.log('Permissions granted:', multiplePermissions);
    return true;
  }

  // No permission specified - allow access
  console.log('No permission specified in route data');
  return true;
};