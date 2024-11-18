import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashDepositEditPage } from './cash-deposit-edit.page';

const routes: Routes = [
  {
    path: '',
    component: CashDepositEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashDepositEditPageRoutingModule {}
