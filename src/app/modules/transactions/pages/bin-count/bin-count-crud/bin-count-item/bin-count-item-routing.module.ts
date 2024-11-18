import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BinCountItemPage } from './bin-count-item.page';

const routes: Routes = [
  {
    path: '',
    component: BinCountItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BinCountItemPageRoutingModule {}
