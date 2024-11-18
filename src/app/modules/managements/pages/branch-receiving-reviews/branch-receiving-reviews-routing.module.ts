import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchReceivingReviewsPage } from './branch-receiving-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: BranchReceivingReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchReceivingReviewsPageRoutingModule {}
