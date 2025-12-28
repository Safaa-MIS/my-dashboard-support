import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApplicationsService } from '@my-dashboard-support/applications-data-access';



@Component({
  selector: 'lib-feature-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feature-cards.html',
  styleUrl: './feature-cards.css',
})
export class FeatureCards {
  private appsService = inject(ApplicationsService);
   private readonly router = inject(Router);

  // Signal from API (auto-unsubscribe)
  apps = toSignal(this.appsService.getApplications(), { initialValue: [] });

  // adds color + router link
vm = computed(() =>
  this.apps().map(app => ({
    ...app,
    link: normalizeRoute(app.route ?? `/applications/${app.name}`),
    cardStyle: {
      '--card-accent': colorFromString(app.name)
    }
  }))
);



}

function normalizeRoute(route: string) {
  if (!route) return '/';
  return route.startsWith('/') ? route : `/${route}`;
}

/**
 * Stable, deterministic color from any string (same app name => same color)
 * Produces a nice HSL color without random changes between refreshes.
 */
function colorFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 70% 45%)`;
}