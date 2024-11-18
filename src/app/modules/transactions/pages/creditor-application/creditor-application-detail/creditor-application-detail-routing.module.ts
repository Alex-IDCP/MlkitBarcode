import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorApplicationDetailPage } from './creditor-application-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorApplicationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorApplicationDetailPageRoutingModule {}
