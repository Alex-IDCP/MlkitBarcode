import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishHeaderPage } from './stock-replenish-header.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishHeaderPageRoutingModule {}
