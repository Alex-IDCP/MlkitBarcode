import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryProcessingApprovalsPage } from './inventory-processing-approvals.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryProcessingApprovalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryProcessingApprovalsPageRoutingModule {}
