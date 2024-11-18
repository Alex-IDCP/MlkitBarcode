import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionInquiryPage } from './transaction-inquiry.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionInquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionInquiryPageRoutingModule {}
