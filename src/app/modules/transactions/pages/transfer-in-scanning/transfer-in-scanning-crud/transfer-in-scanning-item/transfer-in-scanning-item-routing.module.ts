import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInScanningItemPage } from './transfer-in-scanning-item.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInScanningItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInScanningItemPageRoutingModule {}
