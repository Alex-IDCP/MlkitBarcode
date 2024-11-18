import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemSalesHistoryPage } from './item-sales-history.page';

const routes: Routes = [
  {
    path: '',
    component: ItemSalesHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemSalesHistoryPageRoutingModule {}
