import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NonTradePurchaseReqReviewsPage } from './non-trade-purchase-req-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: NonTradePurchaseReqReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NonTradePurchaseReqReviewsPageRoutingModule {}
