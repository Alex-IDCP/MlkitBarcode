import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesHeaderPage } from './consignment-sales-header.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesHeaderPageRoutingModule {}
