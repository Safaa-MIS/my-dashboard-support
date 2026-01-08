import { Route } from '@angular/router';
import { permissionGuard } from '@my-dashboard-support/auth/data-access';
import { authGuard, noAuthGuard } from '@my-dashboard-support/utils';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'applications'
  },

  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('@my-dashboard-support/auth/feature-login')
        .then(m => m.LoginComponent)
  },

  {
    path: 'unauthorized',
    loadComponent: () => 
      import('@my-dashboard-support/shared-ui')
        .then(m => m.UnauthorizedComponent)
  },
  {
    path: 'applications',
    canActivate: [authGuard],

    children: [
      {
        path: '', canActivate: [authGuard],
        loadComponent: () =>
          import('@my-dashboard-support/applicationshub/feature-cards')
            .then(m => m.FeatureCards)
      },
      {
        path: 'premarital',
          canActivate: [permissionGuard],   
   loadComponent: () => import('@my-dashboard-support/shared-ui')
     .then(m => m.MainLayout),
   children: [ 
     {
       path: '',
       canActivate: [permissionGuard],
       data: { permission: 'view_premarital' },
       loadComponent: () => import('@my-dashboard-support/premarital')
         .then(m => m.PremaritalComponent)
     },]},



       {
        path: 'clinicalattachment',
          canActivate: [permissionGuard],   
   loadComponent: () => import('@my-dashboard-support/shared-ui')
     .then(m => m.MainLayout),
   children: [ 
     {
       path: '',
       canActivate: [permissionGuard],
       data: { permission: 'view_clinical_attachment' },
       loadComponent: () =>
         import('@my-dashboard-support/clinical-attachment')
           .then(m => m.ClinicalAttachment)
        },]},
    ]
  },
  // {
  //   path: 'applications',
  //  // canActivate: [authGuard],

  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import('@my-dashboard-support/applications-hub/feature-cards')
  //           .then(m => m.FeatureCards)
  //     },

  //     {
  //       path: 'premarital',
  //         canActivate: [permissionGuard], 
  //   data: { permission: 'view_premarital' },  
  //   loadComponent: () =>
  //      import('@my-dashboard-support/premarital')
  //       .then(m => m.PremaritalComponent)
  //     },

  //     {
  //       path: 'clinicalAttachment',
  //  //     canActivate: [permissionGuard],
  // //      data: { permission: 'view_clinical_attachment' },
  //       loadComponent: () =>
  //         import('@my-dashboard-support/clinicalAttachment')
  //           .then(m => m.ClinicalAttachment)
  //     }
  //   ]
  // },

  {
    path: '**',
    redirectTo: 'applications'
  }
];
