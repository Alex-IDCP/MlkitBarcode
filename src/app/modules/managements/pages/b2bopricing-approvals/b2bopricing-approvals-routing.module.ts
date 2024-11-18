import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2bopricingApprovalsPage } from './b2bopricing-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: B2bopricingApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2bopricingApprovalsPageRoutingModule {}
