import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemCatalogWithoutPricePage } from './item-catalog-without-price.page';

const routes: Routes = [
  {
    path: '',
    component: ItemCatalogWithoutPricePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemCatalogWithoutPricePageRoutingModule {}
