import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SoCodApprovalsPage } from './so-cod-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: SoCodApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoCodApprovalsPageRoutingModule {}
