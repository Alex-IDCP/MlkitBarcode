import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationReviewsPage } from './quotation-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationReviewsPageRoutingModule {}
