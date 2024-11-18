import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountPage } from './consignment-count.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountPage
  },
  {
    path: 'consignment-count-header',
    loadChildren: () => import('./consignment-count-crud/consignment-count-header/consignment-count-header.module').then( m => m.ConsignmentCountHeaderPageModule)
  },
  {
    path: 'consignment-count-item',
    loadChildren: () => import('./consignment-count-crud/consignment-count-item/consignment-count-item.module').then( m => m.ConsignmentCountItemPageModule)
  },
  {
    path: 'consignment-count-detail',
    loadChildren: () => import('./consignment-count-detail/consignment-count-detail.module').then( m => m.ConsignmentCountDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountPageRoutingModule {}
