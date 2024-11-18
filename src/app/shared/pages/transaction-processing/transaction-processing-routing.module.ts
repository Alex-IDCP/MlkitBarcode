import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionProcessingPage } from './transaction-processing.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionProcessingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionProcessingPageRoutingModule {}
