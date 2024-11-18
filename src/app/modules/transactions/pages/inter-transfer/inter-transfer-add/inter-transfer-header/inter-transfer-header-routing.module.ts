import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferHeaderPage } from './inter-transfer-header.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferHeaderPageRoutingModule {}
