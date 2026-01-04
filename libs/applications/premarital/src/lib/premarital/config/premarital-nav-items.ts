import { NavItem } from '@my-dashboard-support/shared/shared-data-access';

export const PremaritalNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'bi-speedometer2',
    route: '/applications/premarital/dashboard',
    permission: 'view_premarital_dashboard'
  },
  {
    label: 'Applications',
    icon: 'bi-file-earmark-text',
    route: '/applications/premarital/list',
    permission: 'view_premarital_applications'
  },
  {
    label: 'Reports',
    icon: 'bi-bar-chart',
    route: '/applications/premarital/reports',
    permission: 'view_premarital_reports'
  },
  {
    label: 'Settings',
    icon: 'bi-gear',
    route: '/applications/premarital/settings',
    permission: 'edit_premarital_settings'
  }
];
