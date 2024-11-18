import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderPage } from './sales-order.page';

const routes: Routes = [
   {
      path: '',
      component: SalesOrderPage
   },
   {
      path: 'sales-order-header',
      loadChildren: () => import('./sales-order-crud/sales-order-header/sales-order-header.module').then(m => m.SalesOrderHeaderPageModule)
   },
   {
      path: 'sales-order-item',
      loadChildren: () => import('./sales-order-crud/sales-order-item/sales-order-item.module').then(m => m.SalesOrderItemPageModule)
   },
   {
      path: 'sales-order-cart',
      loadChildren: () => import('./sales-order-crud/sales-order-cart/sales-order-cart.module').then(m => m.SalesOrderCartPageModule)
   },
   {
      path: 'sales-order-summary',
      loadChildren: () => import('./sales-order-crud/sales-order-summary/sales-order-summary.module').then(m => m.SalesOrderSummaryPageModule)
   },
   {
      path: 'sales-order-detail',
      loadChildren: () => import('./sales-order-detail/sales-order-detail.module').then(m => m.SalesOrderDetailPageModule)
   }

];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class SalesOrderPageRoutingModule { }
