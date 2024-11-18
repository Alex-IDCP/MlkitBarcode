import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesDetailPage } from './consignment-sales-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesDetailPageRoutingModule {}
