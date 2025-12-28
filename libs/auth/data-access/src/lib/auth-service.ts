import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap } from 'rxjs';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@my-dashboard-support/util-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private config = inject(APP_CONFIG);
  //State Management (Signals)
  // null = Initializing, true = In, false = Out
  private _isLoggedIn = signal<boolean | null>(null);
  isLoggedIn = this._isLoggedIn.asReadonly();
  
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  //Startup Check (Security) ---
  // Called by a resolver or APP_INITIALIZER to prevent flickering
  async checkAuthStatus(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${this.config.apiUrl}/auth/status`));      
      this._isLoggedIn.set(true);
      return true;
    } catch {
      this._isLoggedIn.set(false);
      return false;
    }
  }

  login(credentials: { username: string; password: string }) {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
  // Browser automatically sends HttpOnly cookies if withCredentials is true in jwtInterceptor
    return this.http.post(`${this.config.apiUrl}/auth/login`, credentials).pipe(
      tap({
        next: () => {
          this._isLoggedIn.set(true);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this._isLoggedIn.set(false);
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Invalid credentials');
        }
      })
    );
  }

  // ---Logout Action
  logout() {
     // Browser automatically sends HttpOnly cookies if withCredentials is true in jwtInterceptor
    this.http.post(`${this.config.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this._isLoggedIn.set(false);
        this.router.navigate(['/login']);
      }
    });
  }
}
