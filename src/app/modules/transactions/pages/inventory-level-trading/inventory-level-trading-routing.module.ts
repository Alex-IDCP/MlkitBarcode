import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryLevelTradingPage } from './inventory-level-trading.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryLevelTradingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryLevelTradingPageRoutingModule {}
