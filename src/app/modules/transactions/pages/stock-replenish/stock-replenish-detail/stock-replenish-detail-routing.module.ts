import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishDetailPage } from './stock-replenish-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishDetailPageRoutingModule {}
