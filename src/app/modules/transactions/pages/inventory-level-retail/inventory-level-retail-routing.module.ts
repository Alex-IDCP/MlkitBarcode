import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryLevelRetailPage } from './inventory-level-retail.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryLevelRetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryLevelRetailPageRoutingModule {}
