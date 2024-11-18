import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BinCountDetailPage } from './bin-count-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BinCountDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BinCountDetailPageRoutingModule {}
