import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationSummaryPage } from './quotation-summary.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationSummaryPageRoutingModule {}
