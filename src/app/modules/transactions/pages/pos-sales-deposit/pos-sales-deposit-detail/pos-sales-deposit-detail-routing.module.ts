import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PosSalesDepositDetailPage } from './pos-sales-deposit-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PosSalesDepositDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PosSalesDepositDetailPageRoutingModule {}
