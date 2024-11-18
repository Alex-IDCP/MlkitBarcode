import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestApprovalsPage } from './defect-request-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestApprovalsPageRoutingModule {}
