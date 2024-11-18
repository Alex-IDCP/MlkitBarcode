import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferDetailPage } from './inter-transfer-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferDetailPageRoutingModule {}
