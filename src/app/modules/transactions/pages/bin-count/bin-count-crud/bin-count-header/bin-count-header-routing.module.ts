import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BinCountHeaderPage } from './bin-count-header.page';

const routes: Routes = [
  {
    path: '',
    component: BinCountHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BinCountHeaderPageRoutingModule {}
