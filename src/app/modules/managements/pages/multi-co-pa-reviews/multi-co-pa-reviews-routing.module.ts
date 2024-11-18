import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiCoPaReviewsPage } from './multi-co-pa-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: MultiCoPaReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiCoPaReviewsPageRoutingModule {}
