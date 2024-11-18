import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemSalesAnalysisPage } from './item-sales-analysis.page';

const routes: Routes = [
  {
    path: '',
    component: ItemSalesAnalysisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemSalesAnalysisPageRoutingModule {}
