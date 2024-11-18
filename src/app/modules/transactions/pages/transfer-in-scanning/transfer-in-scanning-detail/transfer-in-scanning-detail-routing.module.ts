import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInScanningDetailPage } from './transfer-in-scanning-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInScanningDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInScanningDetailPageRoutingModule {}
