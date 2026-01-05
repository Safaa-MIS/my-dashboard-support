import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavigationService } from '@my-dashboard-support/shared/ui-services';
import { AuthService } from '@my-dashboard-support/auth/data-access';
import { computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'lib-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})

export class MainLayout {
  title = 'DHSupportDashboard';
  navService = inject(NavigationService); 

  authService = inject(AuthService);

  isSidebarOpen = true; 

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 
  openSubmenus = signal<string[]>([]);
  
  toggleSubmenuById(label: string) {
    this.openSubmenus.update(menus => {
      if (menus.includes(label)) {
        return menus.filter(m => m !== label);
      } else {
        return [...menus, label];
      }
    });
  }
  
  isSubmenuOpen(label: string): boolean {
    return this.openSubmenus().includes(label);
  }
   logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        error: (err) => console.error('Logout error:', err)
      });
    }
  }
}
