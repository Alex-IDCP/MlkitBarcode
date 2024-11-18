import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInPage } from './transfer-in.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInPage
  },
  {
    path: 'transfer-in-detail',
    loadChildren: () => import('./transfer-in-detail/transfer-in-detail.module').then( m => m.TransferInDetailPageModule)
  },
  {
    path: 'transfer-in-item',
    loadChildren: () => import('./transfer-in-crud/transfer-in-item/transfer-in-item.module').then( m => m.TransferInItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInPageRoutingModule {}
