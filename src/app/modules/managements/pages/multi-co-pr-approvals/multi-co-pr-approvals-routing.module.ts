import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiCoPrApprovalsPage } from './multi-co-pr-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: MultiCoPrApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiCoPrApprovalsPageRoutingModule {}
