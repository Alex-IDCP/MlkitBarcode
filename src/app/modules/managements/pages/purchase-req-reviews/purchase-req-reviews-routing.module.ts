import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseReqReviewsPage } from './purchase-req-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReqReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseReqReviewsPageRoutingModule {}
