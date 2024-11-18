import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundApprovalsPage } from './refund-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: RefundApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundApprovalsPageRoutingModule {}
