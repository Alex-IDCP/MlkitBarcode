import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BacktobackOrderHeaderPage } from './backtoback-order-header.page';

const routes: Routes = [
  {
    path: '',
    component: BacktobackOrderHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BacktobackOrderHeaderPageRoutingModule {}
