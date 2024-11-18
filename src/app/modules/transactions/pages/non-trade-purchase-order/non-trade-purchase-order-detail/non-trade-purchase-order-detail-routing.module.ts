import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NonTradePurchaseOrderDetailPage } from './non-trade-purchase-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: NonTradePurchaseOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonTradePurchaseOrderDetailPageRoutingModule {}
