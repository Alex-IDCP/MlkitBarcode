import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferOutHeaderPage } from './transfer-out-header.page';

const routes: Routes = [
  {
    path: '',
    component: TransferOutHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferOutHeaderPageRoutingModule {}
