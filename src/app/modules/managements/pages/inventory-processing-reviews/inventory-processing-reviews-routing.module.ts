import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryProcessingReviewsPage } from './inventory-processing-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryProcessingReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryProcessingReviewsPageRoutingModule {}
