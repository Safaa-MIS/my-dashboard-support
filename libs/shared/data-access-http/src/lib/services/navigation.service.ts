import { Injectable, signal } from '@angular/core';
import { NavItem } from '@my-dashboard-support/shared/domain';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Current navigation items
  navItems = signal<NavItem[]>([]);

  // Set navigation
  setNav(items: NavItem[]): void {
    this.navItems.set(items);
  }

  // Clear navigation
  clearNav(): void {
    this.navItems.set([]);
  }
}