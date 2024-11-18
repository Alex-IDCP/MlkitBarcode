import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseReqApprovalsPage } from './purchase-req-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReqApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseReqApprovalsPageRoutingModule {}
