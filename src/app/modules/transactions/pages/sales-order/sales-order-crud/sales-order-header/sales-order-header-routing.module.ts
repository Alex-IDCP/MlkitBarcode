import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderHeaderPage } from './sales-order-header.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderHeaderPageRoutingModule {}
