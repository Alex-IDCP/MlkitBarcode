import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinDetailPage } from './transfer-bin-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinDetailPageRoutingModule {}
