import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';

/**
 * Permission Guard - Checks if user has required permission(s)
 * 
 * Usage in routes:
 * Single permission:
 * data: { permission: 'view_premarital' }
 * Multiple permissions (ANY):
 * data: { 
 *   permissions: ['view_premarital', 'edit_premarital'],
 *   requireAll: false 
 * }
 * Multiple permissions (ALL):
 * data: { 
 *   permissions: ['view_premarital', 'edit_premarital'],
 *   requireAll: true 
 * }
 */
export const permissionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get permission(s) from route data
  const singlePermission = route.data['permission'] as string | undefined;
  const multiplePermissions = route.data['permissions'] as string[] | undefined;
  //const requireAll = route.data['requireAll'] as boolean | undefined;
  const requireAll = route.data['requireAll'] === true;


  // Ensure auth status is checked
  if (authService.isLoggedIn() === null) {
    await authService.checkAuthStatus();
  }

  // Check if user is logged in first
  if (!authService.isLoggedIn()) {
    console.warn('User not logged in, redirecting to login');
    return router.parseUrl('/login');
  }
if (singlePermission && multiplePermissions) {
  console.error('Route has both permission and permissions defined');
  return router.parseUrl('/unauthorized');
}

  // Check single permission
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

  // No permission specified
  console.error('No permission specified in route data');
  return router.parseUrl('/unauthorized');
};