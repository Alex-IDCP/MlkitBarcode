import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpSalesCustomerPage } from './rp-sales-customer.page';

const routes: Routes = [
  {
    path: '',
    component: RpSalesCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpSalesCustomerPageRoutingModule {}
