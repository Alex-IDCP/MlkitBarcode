import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseReqDetailPage } from './purchase-req-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReqDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseReqDetailPageRoutingModule {}
