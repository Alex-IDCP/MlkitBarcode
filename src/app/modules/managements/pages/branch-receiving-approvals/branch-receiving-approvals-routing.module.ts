import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchReceivingApprovalsPage } from './branch-receiving-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: BranchReceivingApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchReceivingApprovalsPageRoutingModule {}
