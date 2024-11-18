import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentArrangementApprovalsPage } from './payment-arrangement-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentArrangementApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentArrangementApprovalsPageRoutingModule {}
