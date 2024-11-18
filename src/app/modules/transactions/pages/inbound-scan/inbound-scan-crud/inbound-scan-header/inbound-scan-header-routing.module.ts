import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboundScanHeaderPage } from './inbound-scan-header.page';

const routes: Routes = [
  {
    path: '',
    component: InboundScanHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboundScanHeaderPageRoutingModule {}
