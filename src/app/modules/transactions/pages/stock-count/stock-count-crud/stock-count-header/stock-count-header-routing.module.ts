import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountHeaderPage } from './stock-count-header.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountHeaderPageRoutingModule {}
