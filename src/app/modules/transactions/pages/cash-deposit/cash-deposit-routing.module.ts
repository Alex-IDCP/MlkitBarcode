import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashDepositPage } from './cash-deposit.page';

const routes: Routes = [
  {
    path: '',
    component: CashDepositPage
  },
  {
    path: 'cash-deposit-add',
    loadChildren: () => import('./cash-deposit-add/cash-deposit-add.module').then( m => m.CashDepositAddPageModule)
  },
  {
    path: 'cash-deposit-detail',
    loadChildren: () => import('./cash-deposit-detail/cash-deposit-detail.module').then( m => m.CashDepositDetailPageModule)
  },
  {
    path: 'cash-deposit-edit',
    loadChildren: () => import('./cash-deposit-edit/cash-deposit-edit.module').then( m => m.CashDepositEditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashDepositPageRoutingModule {}
