import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2bCreditApprovalsPage } from './b2b-credit-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: B2bCreditApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2bCreditApprovalsPageRoutingModule {}
