import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiCoTransactionProcessingPage } from './multico-transaction-processing.page';

const routes: Routes = [
  {
    path: '',
    component: MultiCoTransactionProcessingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiCoTransactionProcessingPageRoutingModule {}
