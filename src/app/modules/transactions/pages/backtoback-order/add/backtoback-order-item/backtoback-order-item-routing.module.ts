import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BacktobackOrderItemPage } from './backtoback-order-item.page';

const routes: Routes = [
  {
    path: '',
    component: BacktobackOrderItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BacktobackOrderItemPageRoutingModule {}
