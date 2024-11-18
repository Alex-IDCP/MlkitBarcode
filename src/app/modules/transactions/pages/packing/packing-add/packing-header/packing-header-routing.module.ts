import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingHeaderPage } from './packing-header.page';

const routes: Routes = [
  {
    path: '',
    component: PackingHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingHeaderPageRoutingModule {}
