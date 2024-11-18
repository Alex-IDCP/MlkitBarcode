import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesCartPage } from './sales-cart.page';

const routes: Routes = [
  {
    path: '',
    component: SalesCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesCartPageRoutingModule {}
