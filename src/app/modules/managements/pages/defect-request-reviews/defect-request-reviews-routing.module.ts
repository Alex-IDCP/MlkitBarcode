import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestReviewsPage } from './defect-request-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestReviewsPageRoutingModule {}
