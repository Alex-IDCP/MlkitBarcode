import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboundScanItemPage } from './inbound-scan-item.page';

const routes: Routes = [
  {
    path: '',
    component: InboundScanItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboundScanItemPageRoutingModule {}
