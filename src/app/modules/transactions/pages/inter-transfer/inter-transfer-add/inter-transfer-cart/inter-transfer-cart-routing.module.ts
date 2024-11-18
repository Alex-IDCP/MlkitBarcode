import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferCartPage } from './inter-transfer-cart.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferCartPageRoutingModule {}
