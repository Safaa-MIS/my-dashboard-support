import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <i class="bi bi-shield-exclamation text-danger" style="font-size: 5rem;"></i>
          <h1 class="mt-4">Access Denied</h1>
          <p class="text-muted">
            You don't have permission to access this page.
          </p>
          <a routerLink="/applications" class="btn btn-primary mt-3">
            <i class="bi bi-house-door me-2"></i>
            Go to Applications
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
    }
  `]
})
export class UnauthorizedComponent {}