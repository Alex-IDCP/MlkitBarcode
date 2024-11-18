import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryAdjReqDetailPage } from './inventory-adj-req-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryAdjReqDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryAdjReqDetailPageRoutingModule {}
