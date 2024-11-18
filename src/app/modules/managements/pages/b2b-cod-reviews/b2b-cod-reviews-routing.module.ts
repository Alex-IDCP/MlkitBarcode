import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { B2bCodReviewsPage } from './b2b-cod-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: B2bCodReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2bCodReviewsPageRoutingModule {}
