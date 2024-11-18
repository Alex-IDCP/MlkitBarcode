import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferOutItemPage } from './transfer-out-item.page';

const routes: Routes = [
  {
    path: '',
    component: TransferOutItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferOutItemPageRoutingModule {}
