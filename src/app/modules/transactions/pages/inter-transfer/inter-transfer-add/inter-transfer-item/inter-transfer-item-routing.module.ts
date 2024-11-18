import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferItemPage } from './inter-transfer-item.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferItemPageRoutingModule {}
