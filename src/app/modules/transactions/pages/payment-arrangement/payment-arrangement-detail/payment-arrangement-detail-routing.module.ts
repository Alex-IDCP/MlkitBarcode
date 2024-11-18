import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentArrangementDetailPage } from './payment-arrangement-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentArrangementDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentArrangementDetailPageRoutingModule {}
