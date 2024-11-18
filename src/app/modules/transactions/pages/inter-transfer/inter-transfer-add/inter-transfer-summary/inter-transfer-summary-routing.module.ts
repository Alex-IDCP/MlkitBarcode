import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterTransferSummaryPage } from './inter-transfer-summary.page';

const routes: Routes = [
  {
    path: '',
    component: InterTransferSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterTransferSummaryPageRoutingModule {}
