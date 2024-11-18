import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderDetailPage } from './stock-reorder-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StockReorderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReorderDetailPageRoutingModule {}
