import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderDetailPage } from './sales-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderDetailPageRoutingModule {}
