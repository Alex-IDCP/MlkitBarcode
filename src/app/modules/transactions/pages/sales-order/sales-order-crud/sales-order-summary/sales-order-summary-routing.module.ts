import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderSummaryPage } from './sales-order-summary.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderSummaryPageRoutingModule {}
