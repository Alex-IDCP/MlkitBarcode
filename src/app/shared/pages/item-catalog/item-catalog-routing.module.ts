import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemCatalogPage } from './item-catalog.page';

const routes: Routes = [
  {
    path: '',
    component: ItemCatalogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemCatalogPageRoutingModule {}
