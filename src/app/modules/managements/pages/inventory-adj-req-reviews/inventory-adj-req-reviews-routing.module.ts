import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryAdjReqReviewsPage } from './inventory-adj-req-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryAdjReqReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryAdjReqReviewsPageRoutingModule {}
