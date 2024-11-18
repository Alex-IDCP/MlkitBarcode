import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PalletAssemblyItemPage } from './pallet-assembly-item.page';

const routes: Routes = [
  {
    path: '',
    component: PalletAssemblyItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PalletAssemblyItemPageRoutingModule {}
