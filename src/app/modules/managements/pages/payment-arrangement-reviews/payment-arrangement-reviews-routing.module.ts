import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentArrangementReviewsPage } from './payment-arrangement-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentArrangementReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentArrangementReviewsPageRoutingModule {}
