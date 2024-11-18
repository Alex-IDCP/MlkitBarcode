import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RetailTransferOutReviewPage } from './retail-transfer-out-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: RetailTransferOutReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RetailTransferOutReviewPageRoutingModule {}
