// libs/applications/premarital/ui/src/lib/page-header/page-header.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">{{ title() }}</h2>
        <p class="text-muted mb-0">{{ subtitle() }}</p>
      </div>
      @if (showAction()) {
        <button class="btn btn-primary" (click)="actionClick.emit()">
          <i [class]="actionIcon() + ' me-2'"></i>{{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  showAction = input<boolean>(true);
  actionIcon = input<string>('bi bi-plus-circle');
  actionLabel = input<string>('Add New');
  actionClick = output<void>();
}