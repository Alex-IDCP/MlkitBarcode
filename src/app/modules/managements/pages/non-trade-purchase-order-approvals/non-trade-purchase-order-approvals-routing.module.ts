import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NonTradePurchaseOrderApprovalsPage } from './non-trade-purchase-order-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: NonTradePurchaseOrderApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonTradePurchaseOrderApprovalsPageRoutingModule {}
