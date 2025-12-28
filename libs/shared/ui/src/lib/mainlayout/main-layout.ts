import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'lib-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})

export class MainLayout {
  title = 'DHSupportDashboard';
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
}
