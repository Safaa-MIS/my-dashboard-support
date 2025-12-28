import { Component } from '@angular/core';

@Component({
  selector: 'lib-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})

export class Sidebar {
  title = 'DHSupportDashboard';
  isSidebarOpen = true;
  isDashboardOpen = false; // submenu toggle
toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

}
