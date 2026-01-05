import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApplicationsService } from '@my-dashboard-support/applications-data-access';
import { AuthService } from '@my-dashboard-support/auth/data-access';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'lib-feature-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feature-cards.html',
  styleUrl: './feature-cards.css',
})
export class FeatureCards implements OnInit {
  private appsService = inject(ApplicationsService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Check authentication status first
  ngOnInit() {
    const user = this.authService.user();
    if (!user) {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
    }
  }

  // Handle API errors and distinguish auth vs other errors
  apps = toSignal(
    this.appsService.getApplications().pipe(
      catchError((error) => {
        // Check if error is authentication-related (401/403)
        if (error?.status === 401 || error?.status === 403) {
          this.router.navigate(['/login']);
          return of([]);
        }
        // For other errors, show error message
        console.error('Failed to load applications:', error);
        return of([]); // Return empty array to avoid breaking the UI
      })
    ),
    { initialValue: [] }
  );

  vm = computed(() =>
    this.apps().map(app => ({
      ...app,
      link: normalizeRoute(app.route ?? `/applications/${app.name}`),
      cardStyle: {
        '--card-accent': colorFromString(app.name)
      }
    }))
  );

  readonly currentUser = computed(() => this.authService.user());

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => console.error('Logout failed:', err)
      });
    }
  }
}


function normalizeRoute(route: string) {
  if (!route) return '/';
  return route.startsWith('/') ? route : `/${route}`;
}

function colorFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 70% 45%)`;
}