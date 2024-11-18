import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtorApplicationEditPage } from './debtor-application-edit.page';

const routes: Routes = [
  {
    path: '',
    component: DebtorApplicationEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtorApplicationEditPageRoutingModule {}
