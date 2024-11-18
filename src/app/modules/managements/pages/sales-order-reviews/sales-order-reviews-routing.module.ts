import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderReviewsPage } from './sales-order-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderReviewsPageRoutingModule {}
