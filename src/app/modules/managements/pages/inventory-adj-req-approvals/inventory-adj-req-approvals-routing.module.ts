import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryAdjReqApprovalsPage } from './inventory-adj-req-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryAdjReqApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryAdjReqApprovalsPageRoutingModule {}
