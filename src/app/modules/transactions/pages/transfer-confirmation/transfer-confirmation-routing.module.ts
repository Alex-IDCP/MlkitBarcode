import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferConfirmationPage } from './transfer-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: TransferConfirmationPage
  },
  {
    path: 'transfer-confirmation-item',
    loadChildren: () => import('./transfer-confirmation-item/transfer-confirmation-item.module').then( m => m.TransferConfirmationItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferConfirmationPageRoutingModule {}
