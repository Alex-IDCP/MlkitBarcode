import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestPage } from './defect-request.page';

const routes: Routes = [
   {
      path: '',
      component: DefectRequestPage
   },
   {
      path: 'defect-request-detail',
      loadChildren: () => import('./defect-request-detail/defect-request-detail.module').then(m => m.DefectRequestDetailPageModule)
   },
  {
    path: 'defect-request-header',
    loadChildren: () => import('./defect-request-crud/defect-request-header/defect-request-header.module').then( m => m.DefectRequestHeaderPageModule)
  },
  {
    path: 'defect-request-item',
    loadChildren: () => import('./defect-request-crud/defect-request-item/defect-request-item.module').then( m => m.DefectRequestItemPageModule)
  },
  {
    path: 'defect-request-cart',
    loadChildren: () => import('./defect-request-crud/defect-request-cart/defect-request-cart.module').then( m => m.DefectRequestCartPageModule)
  }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class DefectRequestPageRoutingModule { }
