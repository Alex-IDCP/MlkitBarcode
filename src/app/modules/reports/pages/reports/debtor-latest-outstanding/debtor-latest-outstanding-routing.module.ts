import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtorLatestOutstandingPage } from './debtor-latest-outstanding.page';

const routes: Routes = [
  {
    path: '',
    component: DebtorLatestOutstandingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtorLatestOutstandingPageRoutingModule {}
