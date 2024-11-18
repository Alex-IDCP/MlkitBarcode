import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountDetailPage } from './stock-count-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountDetailPageRoutingModule {}
