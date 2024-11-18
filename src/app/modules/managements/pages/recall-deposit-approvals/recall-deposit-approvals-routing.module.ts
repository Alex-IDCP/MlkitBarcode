import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecallDepositApprovalsPage } from './recall-deposit-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: RecallDepositApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecallDepositApprovalsPageRoutingModule {}
