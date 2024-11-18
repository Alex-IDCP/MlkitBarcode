import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoTransferOutApprovalsPage } from './co-transfer-out-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: CoTransferOutApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoTransferOutApprovalsPageRoutingModule {}
