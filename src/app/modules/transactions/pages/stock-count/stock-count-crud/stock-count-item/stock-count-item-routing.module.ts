import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountItemPage } from './stock-count-item.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountItemPageRoutingModule {}
