import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderItemPage } from './stock-reorder-item.page';

const routes: Routes = [
  {
    path: '',
    component: StockReorderItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReorderItemPageRoutingModule {}
