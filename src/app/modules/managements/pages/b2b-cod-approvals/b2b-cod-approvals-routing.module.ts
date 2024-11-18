import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2bCodApprovalsPage } from './b2b-cod-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: B2bCodApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2bCodApprovalsPageRoutingModule {}
