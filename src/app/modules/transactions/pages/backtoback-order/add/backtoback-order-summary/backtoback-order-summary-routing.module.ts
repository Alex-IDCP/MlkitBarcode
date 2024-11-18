import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BacktobackOrderSummaryPage } from './backtoback-order-summary.page';

const routes: Routes = [
  {
    path: '',
    component: BacktobackOrderSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BacktobackOrderSummaryPageRoutingModule {}
