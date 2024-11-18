import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderCartPage } from './sales-order-cart.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderCartPageRoutingModule {}
