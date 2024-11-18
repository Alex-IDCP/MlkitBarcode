import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PosApprovalProcessingPage } from './pos-approval-processing.page';

const routes: Routes = [
  {
    path: '',
    component: PosApprovalProcessingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PosApprovalProcessingPageRoutingModule {}
