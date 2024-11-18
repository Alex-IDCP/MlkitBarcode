import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingItemPage } from './packing-item.page';

const routes: Routes = [
  {
    path: '',
    component: PackingItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingItemPageRoutingModule {}
