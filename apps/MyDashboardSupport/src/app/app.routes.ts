import { Route } from '@angular/router';
import { authGuard, noAuthGuard } from '@my-dashboard-support/utils';
import { permissionGuard } from '@my-dashboard-support/data-access';  

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
 {
    path: 'unauthorized',
    loadComponent: () => import('@my-dashboard-support/shared-ui').then(m => m.UnauthorizedComponent)
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
        canActivate: [permissionGuard],
        data: { permission: 'view_premarital' },
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
        //Permission guard (optional)
        canActivate: [permissionGuard],
        data: { permission: 'view_clinical_attachment' },
        loadComponent: () => import('@my-dashboard-support/clinicalAttachment')
          .then(m => m.ClinicalAttachment)
      }
    ] 
  },

  // //role-based route (Admin only)
  // {
  //   path: 'admin',
  //   canActivate: [authGuard, roleGuard],
  //   data: { role: 'Admin' },
  //   loadComponent: () => import('@my-dashboard-support/shared-ui')
  //     .then(m => m.MainLayout),
  //   children: [
  //     {
  //       path: 'users',
  //       canActivate: [permissionGuard],
  //       data: { 
  //         permissions: ['view_users', 'edit_users'],
  //         requireAll: false  // User needs ANY of these permissions
  //       },
  //       loadComponent: () => import('./admin/users.component')
  //         .then(m => m.UsersComponent)
  //     }
  //   ]
  // },

  /* ================= FALLBACK ================= */
  {
    path: '**',
    redirectTo: 'applications'
  }
];
