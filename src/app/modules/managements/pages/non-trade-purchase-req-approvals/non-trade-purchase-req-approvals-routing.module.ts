import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NonTradePurchaseReqApprovalsPage } from './non-trade-purchase-req-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: NonTradePurchaseReqApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonTradePurchaseReqApprovalsPageRoutingModule {}
