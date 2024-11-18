import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomConsignmentSalesReportPage } from './custom-consignment-sales-report.page';

const routes: Routes = [
  {
    path: '',
    component: CustomConsignmentSalesReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomConsignmentSalesReportPageRoutingModule {}
