import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NonTradePurchaseReqDetailPage } from './non-trade-purchase-req-detail.page';

const routes: Routes = [
  {
    path: '',
    component: NonTradePurchaseReqDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonTradePurchaseReqDetailPageRoutingModule {}
