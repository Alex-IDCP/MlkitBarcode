import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinItemPage } from './transfer-bin-item.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinItemPageRoutingModule {}
