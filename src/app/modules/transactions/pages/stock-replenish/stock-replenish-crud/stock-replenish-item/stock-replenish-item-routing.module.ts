import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishItemPage } from './stock-replenish-item.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishItemPageRoutingModule {}
