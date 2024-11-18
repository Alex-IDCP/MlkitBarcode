import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackToBackOrderPage } from './backtoback-order.page';

const routes: Routes = [
  {
    path: '',
    component: BackToBackOrderPage
  },
  {
    path: 'backtoback-order-header',
    loadChildren: () => import('./add/backtoback-order-header/backtoback-order-header.module').then( m => m.BacktobackOrderHeaderPageModule)
  },
  {
    path: 'backtoback-order-item',
    loadChildren: () => import('./add/backtoback-order-item/backtoback-order-item.module').then( m => m.BacktobackOrderItemPageModule)
  },
  {
    path: 'backtoback-order-cart',
    loadChildren: () => import('./add/backtoback-order-cart/backtoback-order-cart.module').then( m => m.BacktobackOrderCartPageModule)
  },
  {
    path: 'backtoback-order-detail',
    loadChildren: () => import('./detail/backtoback-order-detail/backtoback-order-detail.module').then( m => m.BacktobackOrderDetailPageModule)
  },
  {
    path: 'backtoback-order-summary',
    loadChildren: () => import('./add/backtoback-order-summary/backtoback-order-summary.module').then( m => m.BacktobackOrderSummaryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackToBackOrderPageRoutingModule {}
