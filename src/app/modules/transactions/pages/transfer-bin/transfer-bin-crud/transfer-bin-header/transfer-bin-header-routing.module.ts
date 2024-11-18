import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinHeaderPage } from './transfer-bin-header.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinHeaderPageRoutingModule {}
