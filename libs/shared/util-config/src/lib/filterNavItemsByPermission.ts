import { NavItem } from '@my-dashboard-support/shared/domain';

export function filterNavItemsByPermission(navItems: NavItem[], permissions: string[]): NavItem[] {
  return navItems
    .filter(item => !item.permission || permissions.includes(item.permission))
    .map(item => ({
      ...item,
      children: item.children ? filterNavItemsByPermission(item.children, permissions) : undefined
    }));
}
