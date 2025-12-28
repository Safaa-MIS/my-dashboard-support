import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  production: boolean;
}

// Create the Injection Token
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
