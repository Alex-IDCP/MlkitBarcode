import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboundScanDetailPage } from './inbound-scan-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InboundScanDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboundScanDetailPageRoutingModule {}
