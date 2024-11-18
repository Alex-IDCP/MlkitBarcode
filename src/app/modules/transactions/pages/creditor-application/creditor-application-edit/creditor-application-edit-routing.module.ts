import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorApplicationEditPage } from './creditor-application-edit.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorApplicationEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorApplicationEditPageRoutingModule {}
