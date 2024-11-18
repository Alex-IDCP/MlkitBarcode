import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInDetailPage } from './transfer-in-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInDetailPageRoutingModule {}
