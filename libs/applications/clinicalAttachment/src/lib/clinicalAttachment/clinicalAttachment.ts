import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NavigationService } from '@my-dashboard-support/shared/ui-services';
@Component({
  selector: 'lib-clinical-attachment',
  imports: [],
  templateUrl: './clinicalAttachment.html',
  styleUrl: './clinicalAttachment.css',
})
export class ClinicalAttachment implements OnInit,OnDestroy { 
   private readonly navService = inject(NavigationService);
   ngOnInit(): void {
    //SET NAVIGATION
     this.navService.setNav([
      {
        label: 'Applications',
        icon: 'bi-file-medical',
        route: '/applications/clinicalattachment',
        children: [
          {
            label: 'Applications',
            icon: 'bi-list-ul',
            route: '/applications/clinicalattachment/applications',            
            permission: 'view_clinical_dashboard'  
          },
          {
            label: 'Details',
            icon: 'bi-info-circle',
            route: '/applications/clinicalattachment/details',
            permission: 'view_clinical_Details'
          },
          {
            label: 'Reviews',
            icon: 'bi-star',
            route: '/applications/clinicalattachment/reviews',
            permission: 'view_clinical_Reviews'
          }
        ],            
        permission: 'view_clinical_dashboard'  
      }
    ]);
  }   
  ngOnDestroy(): void {
    //CLEAR NAVIGATION
    this.navService.clearNav();
  }
  }
