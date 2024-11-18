import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderItemPage } from './sales-order-item.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderItemPageRoutingModule {}
