import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesItemPage } from './consignment-sales-item.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesItemPageRoutingModule {}
