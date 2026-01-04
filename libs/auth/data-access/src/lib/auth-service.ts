import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, shareReplay, BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
import { LoggerService } from '@my-dashboard-support/shared/shared-data-access';
import { ROUTES, API_ENDPOINTS, TIMING, MESSAGES } from '@my-dashboard-support/domain';

interface AuthResponse {
  user: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[]; 
  };
}

interface SessionStatusResponse {
  user: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[]; 
  };
}

/**
 * Authentication Service
 * Responsibilities:
 *   Manage user authentication state
 *   Handle login/logout operations
 *   Check authorization (roles & permissions)
 *   Cache authentication status
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependencies
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly config = inject(APP_CONFIG);

  // State management with signals (zoneless ready)
  private readonly currentUser = signal<AuthResponse['user'] | null>(null);
  private readonly loggedIn = signal<boolean | null>(null);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed signals (memoized)
  readonly isLoggedIn = computed(() => this.loggedIn());
  readonly user = computed(() => this.currentUser());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly userPermissions = computed(() => this.currentUser()?.permissions ?? []);

  // Auth status cache
  private authStatusCache$: Observable<boolean> | null = null;
  private currentUserSubject = new BehaviorSubject<SessionStatusResponse['user'] | null>(null);
  
  constructor() {
    // Check auth status on service initialization
    this.checkAuthStatus().subscribe();
  }

  /**
   * Login user with credentials 
   * @param credentials - Username and password
   * @returns Observable of auth response
   */
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    
    const endpoint = `${this.config.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
    
    return this.http.post<AuthResponse>(
      endpoint,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.currentUser.set(response.user);
        this.loggedIn.set(true);
        this.isSubmitting.set(false);
        this.logger.info('User logged in successfully', 'AuthService', {
          userId: response.user.id,
          username: response.user.username
        });
      }),
      catchError(error => {
        this.loggedIn.set(false);
        this.isSubmitting.set(false);
        const message = error.error?.message || MESSAGES.ERROR.GENERIC;
        this.errorMessage.set(message);
        this.logger.error('Login failed', error, 'AuthService');
        throw error;
      })
    );
  }

  /**
   * Check current authentication status
   * Implements caching to reduce API calls
   * @returns Observable of authentication status
   */
  checkAuthStatus(): Observable<boolean> {
    // Return cached observable if exists
    if (this.authStatusCache$) {
      return this.authStatusCache$;
    }

    const endpoint = `${this.config.apiUrl}${API_ENDPOINTS.AUTH.STATUS}`;

    // Create new observable with caching
    this.authStatusCache$ = this.http.get<SessionStatusResponse>(
      endpoint,
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response?.user) {
          this.currentUser.set(response.user);
          this.loggedIn.set(true);
          this.currentUserSubject.next(response.user);
          return true;
        }
        this.clearAuthState();
        return false;
      }),
      catchError((error) => {
        this.logger.warn('Auth status check failed', 'AuthService', { error: error.message });
        this.clearAuthState();
        return of(false);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      tap(() => {
        // Clear cache after configured timeout
        setTimeout(() => this.authStatusCache$ = null, TIMING.CACHE.AUTH_STATUS);
      })
    );

    return this.authStatusCache$;
  }

  /**
   * Logout user
   * @returns Observable of void
   */
  logout(): Observable<void> {
    const endpoint = `${this.config.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`;
    
    return this.http.post<void>(
      endpoint,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.logger.flush();
        this.clearAuthState();
        this.logger.info('User logged out', 'AuthService');
        this.router.navigate([ROUTES.AUTH.LOGIN]);
      }),
      catchError(error => {
        this.logger.error('Logout failed', error, 'AuthService');
        // Clear state anyway on error
        this.clearAuthState();
        this.router.navigate([ROUTES.AUTH.LOGIN]);
        return of(void 0);
      })
    );
  }

  /**
   * Check if user has a specific role
   * @param role - Role to check
   * @returns boolean indicating if user has role
   */
  hasRole(role: string): boolean {
    const roles = this.userRoles();
    return roles.includes(role);
  }

  /**
   * Check if user has ANY of the specified roles
   * @param roles - Array of roles to check
   * @returns boolean indicating if user has any role
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has ALL of the specified roles
   * @param roles - Array of roles to check
   * @returns boolean indicating if user has all roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Check if user has a specific permission
   * @param permission - Permission to check
   * @returns boolean indicating if user has permission
   */
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has ANY of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if user has any permission
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has ALL of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if user has all permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Clear authentication state
   * Private method to reset all auth-related state
   */
  private clearAuthState(): void {
    this.currentUser.set(null);
    this.loggedIn.set(false);
    this.authStatusCache$ = null;
    this.currentUserSubject.next(null);
  }

  /**
   * Refresh access token
   * @returns Observable of success message
   */
  refreshToken(): Observable<{ message: string }> {
    const endpoint = `${this.config.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`;
    
    return this.http.post<{ message: string }>(
      endpoint,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.logger.info('Token refreshed successfully', 'AuthService');
      }),
      catchError(error => {
        this.logger.error('Token refresh failed', error, 'AuthService');
        this.clearAuthState();
        this.router.navigate([ROUTES.AUTH.LOGIN]);
        throw error;
      })
    );
  }
}