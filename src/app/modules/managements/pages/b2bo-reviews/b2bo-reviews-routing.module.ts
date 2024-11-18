import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2boReviewsPage } from './b2bo-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: B2boReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2boReviewsPageRoutingModule {}
