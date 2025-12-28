import { Route } from '@angular/router';
import { authGuard, noAuthGuard } from '@my-dashboard-support/utils';

export const appRoutes: Route[] = [

  /* ================= EMPTY PATH ================= */
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'applications'
  },

  /* ================= LOGIN ================= */
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('@my-dashboard-support/feature-login')
        .then(m => m.Logincomponent)
  },

  /* ================= APPLICATION LIST (NO LAYOUT) ================= */
  {
    path: 'applications',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@my-dashboard-support/feature-cards')
        .then(m => m.FeatureCards)
  },

 /* ================= PREMARITAL APPLICATION ================= */
  { 
    path: 'applications/premarital',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('@my-dashboard-support/shared-ui')
      .then(m => m.MainLayout),
    children: [ 
      {
        path: '',
        loadComponent: () => import('@my-dashboard-support/premarital')
          .then(m => m.PremaritalComponent)
      }
    ] 
  },

  /* ================= CLINICAL ATTACHMENT APPLICATION ================= */
  { 
    path: 'applications/clinicalattachment',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('@my-dashboard-support/shared-ui')
      .then(m => m.MainLayout),
    children: [ 
      {
        path: '',
        loadComponent: () => import('@my-dashboard-support/clinicalAttachment')
          .then(m => m.ClinicalAttachment)
      }
    ] 
  },

  /* ================= FALLBACK ================= */
  {
    path: '**',
    redirectTo: 'applications'
  }
];