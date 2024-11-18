import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferConfirmationItemPage } from './transfer-confirmation-item.page';

const routes: Routes = [
  {
    path: '',
    component: TransferConfirmationItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferConfirmationItemPageRoutingModule {}
