import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PalletAssemblyDetailPage } from './pallet-assembly-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PalletAssemblyDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PalletAssemblyDetailPageRoutingModule {}
