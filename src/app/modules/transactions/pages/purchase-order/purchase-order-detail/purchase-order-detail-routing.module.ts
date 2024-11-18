import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseOrderDetailPage } from './purchase-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseOrderDetailPageRoutingModule {}
