import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoTransferOutReviewPage } from './co-transfer-out-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: CoTransferOutReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoTransferOutReviewPageRoutingModule {}
