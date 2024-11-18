import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingDetailPage } from './packing-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PackingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingDetailPageRoutingModule {}
