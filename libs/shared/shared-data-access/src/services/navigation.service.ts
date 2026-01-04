import { Injectable, signal } from '@angular/core';

export interface NavItem {
  label: string;
  icon?: string;
  route: string;
  children?: NavItem[];
  permission?: string; 
}

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