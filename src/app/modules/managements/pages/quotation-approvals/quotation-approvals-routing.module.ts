import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationApprovalsPage } from './quotation-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationApprovalsPageRoutingModule {}
