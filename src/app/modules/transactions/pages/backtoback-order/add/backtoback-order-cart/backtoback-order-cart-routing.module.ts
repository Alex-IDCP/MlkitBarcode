import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BacktobackOrderCartPage } from './backtoback-order-cart.page';

const routes: Routes = [
  {
    path: '',
    component: BacktobackOrderCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BacktobackOrderCartPageRoutingModule {}
