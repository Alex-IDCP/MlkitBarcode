import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RetailTransferOutApprovalsPage } from './retail-transfer-out-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: RetailTransferOutApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RetailTransferOutApprovalsPageRoutingModule {}
