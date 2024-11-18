import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryCountProcessingDetailPage } from './inventory-count-processing-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryCountProcessingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryCountProcessingDetailPageRoutingModule {}
