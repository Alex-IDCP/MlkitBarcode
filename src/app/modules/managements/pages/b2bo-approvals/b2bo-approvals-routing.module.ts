import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2boApprovalsPage } from './b2bo-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: B2boApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2boApprovalsPageRoutingModule {}
