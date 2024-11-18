import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemAddListFlatPage } from './item-add-list-flat.page';

const routes: Routes = [
  {
    path: '',
    component: ItemAddListFlatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemAddListFlatPageRoutingModule {}
