import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishCartPage } from './stock-replenish-cart.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishCartPageRoutingModule {}
