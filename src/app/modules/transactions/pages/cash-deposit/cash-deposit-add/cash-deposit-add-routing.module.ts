import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashDepositAddPage } from './cash-deposit-add.page';

const routes: Routes = [
  {
    path: '',
    component: CashDepositAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashDepositAddPageRoutingModule {}
