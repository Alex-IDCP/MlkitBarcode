import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SomxqApprovalPage } from './somxq-approval.page';

const routes: Routes = [
  {
    path: '',
    component: SomxqApprovalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SomxqApprovalPageRoutingModule {}
