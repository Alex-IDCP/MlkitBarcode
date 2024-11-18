import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PalletAssemblyPage } from './pallet-assembly.page';

const routes: Routes = [
  {
    path: '',
    component: PalletAssemblyPage
  },
  {
    path: 'pallet-assembly-detail',
    loadChildren: () => import('./pallet-assembly-detail/pallet-assembly-detail.module').then( m => m.PalletAssemblyDetailPageModule)
  },
  {
    path: 'pallet-assembly-header',
    loadChildren: () => import('./pallet-assembly-crud/pallet-assembly-header/pallet-assembly-header.module').then( m => m.PalletAssemblyHeaderPageModule)
  },
  {
    path: 'pallet-assembly-item',
    loadChildren: () => import('./pallet-assembly-crud/pallet-assembly-item/pallet-assembly-item.module').then( m => m.PalletAssemblyItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PalletAssemblyPageRoutingModule {}
