import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavigationService } from '@my-dashboard-support/shared/shared-data-access';
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
   isSubmenu1Open = signal(false);

  toggleSubmenu() {
    this.isSubmenu1Open.update(val => !val);
  }
  
 //SIDEBAR VISIBILITY: true means expanded, false means collapsed
  isSidebarOpen = true; 

  /**
   * Toggles the state of the main sidebar.
   */
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
    // ADD these for dropdown menus
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
}
