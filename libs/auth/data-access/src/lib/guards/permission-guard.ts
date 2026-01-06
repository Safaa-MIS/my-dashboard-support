// libs/auth/data-access/src/lib/guards/permission.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-service';
  interface PermissionRouteData {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => { 
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get permission/permissions from route data
 // const singlePermission = route.data['permission'] as string | undefined;
 // const multiplePermissions = route.data['permissions'] as string[] | undefined;
 // const requireAll = route.data['requireAll'] === true;
  const { permission, permissions, requireAll } = route.data as PermissionRouteData;
  
  // Check if logged in first (synchronous)
  if (!authService.isLoggedIn()) {
    console.warn('User not logged in, redirecting to login');
    return router.parseUrl('/login');
  }

  if (permission && permissions) {
    console.error('Route has both permission and permissions defined');
    return router.parseUrl('/unauthorized');
  }

  // Check  permission
  if (permission) {
    const hasPermission = authService.hasPermission(permission);
    
    if (!hasPermission) {
      console.warn(`Permission denied: ${permission}`);
      console.warn('User permissions:', authService.userPermissions());
      return router.parseUrl('/unauthorized');
    }
    
    console.log(`Permission granted: ${permission}`);
    return true;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasPermissions = requireAll 
      ? authService.hasAllPermissions(permissions)
      : authService.hasAnyPermission(permissions);
    
    if (!hasPermissions) {
      const mode = requireAll ? 'ALL' : 'ANY';
      console.warn(`Permissions denied (need ${mode} of):`, permissions);
      console.warn('User permissions:', authService.userPermissions());
      return router.parseUrl('/unauthorized');
    }
    
    console.log('Permissions granted:', permissions);
    return true;
  }

  // No permission specified - allow access
  console.log('No permission specified in route data');
  return true;
};