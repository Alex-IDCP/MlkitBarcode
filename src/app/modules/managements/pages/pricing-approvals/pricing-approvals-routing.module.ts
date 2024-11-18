import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PricingApprovalsPage } from './pricing-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: PricingApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingApprovalsPageRoutingModule {}
