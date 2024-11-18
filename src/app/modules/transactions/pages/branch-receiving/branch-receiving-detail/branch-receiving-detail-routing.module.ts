import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchReceivingDetailPage } from './branch-receiving-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BranchReceivingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchReceivingDetailPageRoutingModule {}
