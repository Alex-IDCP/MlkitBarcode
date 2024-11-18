import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiCoPoApprovalsPage } from './multi-co-po-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: MultiCoPoApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiCoPoApprovalsPageRoutingModule {}
