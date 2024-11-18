import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SoCodReviewsPage } from './so-cod-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: SoCodReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoCodReviewsPageRoutingModule {}
