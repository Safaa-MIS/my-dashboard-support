import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, shareReplay, BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
import { LoggerService } from '@my-dashboard-support/shared/shared-data-access';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  // Signals 
  private readonly currentUser = signal<AuthResponse['user'] | null>(null);
  private readonly loggedIn = signal<boolean | null>(null);

  // Computed signals
  readonly isLoggedIn = computed(() => this.loggedIn());
  readonly user = computed(() => this.currentUser());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly userPermissions = computed(() => this.currentUser()?.permissions ?? []); // NEW
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  private config = inject(APP_CONFIG);
  
  constructor() {
    // Check auth status on service initialization
    this.checkAuthStatus();
  }

  /**
   * Login user with credentials
   */
  login(credentials: { username: string; password: string }) : Observable<AuthResponse> {
        this.isSubmitting.set(true);
    this.errorMessage.set(null);
    return this.http.post<AuthResponse>(
     `${this.config.apiUrl}/auth/login`,
     credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.currentUser.set(response.user);
        this.loggedIn.set(true);
        this.isSubmitting.set(false);
     //   console.log('Login successful', response.user);
      }),
      catchError(error => {
     //   console.error('Login failed', error.error?.message);
        this.loggedIn.set(false);
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Invalid credentials');
        throw error;
      })
    );
  }

  // Check current authentication status
private authStatusCache$: Observable<boolean> | null = null;
private currentUserSubject = new BehaviorSubject<SessionStatusResponse['user']  | null>(null);

checkAuthStatus(): Observable<boolean> {

  // Return cached observable if exists
  if (this.authStatusCache$) {
    return this.authStatusCache$;
  }

  // Create new observable with caching
  this.authStatusCache$ = this.http.get<SessionStatusResponse>(
    `${this.config.apiUrl}/auth/status`,
    { withCredentials: true }
  ).pipe(
    map(response => {
      if (response?.user) {
        this.currentUserSubject.next(response.user);
        return true;
      }
      this.clearAuthState();
      return false;
    }),
    catchError(() => {
      this.clearAuthState();
      return of(false);
    }),
    shareReplay({ bufferSize: 1, refCount: true }), //CACHE IT
    tap(() => {
      // Clear cache after 30 seconds
      setTimeout(() => this.authStatusCache$ = null, 30000);
    })
  );

  return this.authStatusCache$;
}

  /**
   * Logout user
   */
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.config.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {        
        this.logger.flush();
        this.clearAuthState();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout failed', error);
        // Clear state anyway on error
        this.clearAuthState();
        this.router.navigate(['/login']);
        return of(void 0);
      })
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.userRoles();
    return roles.includes(role);
  }

  /**
   * Check if user has ANY of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has ALL of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.currentUser.set(null);
    this.loggedIn.set(false);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.config.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log('Token refreshed successfully');
      }),
      catchError(error => {
        console.error('Token refresh failed', error);
        this.clearAuthState();
        this.router.navigate(['/login']);
        throw error;
      })
    );
  }
}