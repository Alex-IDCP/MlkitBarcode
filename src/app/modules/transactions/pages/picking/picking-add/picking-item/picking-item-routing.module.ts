import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingItemPage } from './picking-item.page';

const routes: Routes = [
  {
    path: '',
    component: PickingItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemPageRoutingModule {}
