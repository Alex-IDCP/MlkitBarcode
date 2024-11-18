import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferPage } from './inter-transfer.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferPage
  },
  {
    path: 'inter-transfer-detail',
    loadChildren: () => import('./inter-transfer-detail/inter-transfer-detail.module').then( m => m.InterTransferDetailPageModule)
  },
  {
    path: 'inter-transfer-header',
    loadChildren: () => import('./inter-transfer-add/inter-transfer-header/inter-transfer-header.module').then( m => m.InterTransferHeaderPageModule)
  },
  {
    path: 'inter-transfer-item',
    loadChildren: () => import('./inter-transfer-add/inter-transfer-item/inter-transfer-item.module').then( m => m.InterTransferItemPageModule)
  },
  {
    path: 'inter-transfer-cart',
    loadChildren: () => import('./inter-transfer-add/inter-transfer-cart/inter-transfer-cart.module').then( m => m.InterTransferCartPageModule)
  },
  {
    path: 'inter-transfer-summary',
    loadChildren: () => import('./inter-transfer-add/inter-transfer-summary/inter-transfer-summary.module').then( m => m.InterTransferSummaryPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferPageRoutingModule {}
