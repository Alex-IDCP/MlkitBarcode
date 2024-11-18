import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BacktobackOrderDetailPage } from './backtoback-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BacktobackOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BacktobackOrderDetailPageRoutingModule {}
