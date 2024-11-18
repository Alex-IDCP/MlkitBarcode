import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtorApplicationDetailPage } from './debtor-application-detail.page';

const routes: Routes = [
  {
    path: '',
    component: DebtorApplicationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtorApplicationDetailPageRoutingModule {}
