import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInItemPage } from './transfer-in-item.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInItemPageRoutingModule {}
