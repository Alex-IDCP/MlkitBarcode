import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExchangeApprovalsPage } from './exchange-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: ExchangeApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExchangeApprovalsPageRoutingModule {}
