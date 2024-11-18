import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingHeaderPage } from './picking-header.page';

const routes: Routes = [
  {
    path: '',
    component: PickingHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingHeaderPageRoutingModule {}
