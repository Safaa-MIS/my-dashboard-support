// libs/shared/domain/navigation/navigation-config.interface.ts

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  children?: NavigationItem[];
  permissions?: string[];
  badge?: {
    text: string;
    variant: 'primary' | 'danger' | 'warning' | 'success';
  };
}

export interface NavigationConfig {
  appId: string;
  items: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: {
    label: string;
    icon?: string;
    action: () => void;
    variant?: string;
  }[];
}