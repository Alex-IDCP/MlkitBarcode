import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingDetailPage } from './picking-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PickingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingDetailPageRoutingModule {}
