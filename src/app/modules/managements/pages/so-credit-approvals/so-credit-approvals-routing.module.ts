import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SoCreditApprovalsPage } from './so-credit-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: SoCreditApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoCreditApprovalsPageRoutingModule {}
