import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinPage } from './transfer-bin.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinPage
  },  {
    path: 'transfer-bin-detail',
    loadChildren: () => import('./transfer-bin-detail/transfer-bin-detail.module').then( m => m.TransferBinDetailPageModule)
  },
  {
    path: 'transfer-bin-header',
    loadChildren: () => import('./transfer-bin-crud/transfer-bin-header/transfer-bin-header.module').then( m => m.TransferBinHeaderPageModule)
  },
  {
    path: 'transfer-bin-item',
    loadChildren: () => import('./transfer-bin-crud/transfer-bin-item/transfer-bin-item.module').then( m => m.TransferBinItemPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinPageRoutingModule {}
