import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboundScanPage } from './inbound-scan.page';

const routes: Routes = [
  {
    path: '',
    component: InboundScanPage
  },
  {
    path: 'inbound-scan-detail',
    loadChildren: () => import('./inbound-scan-detail/inbound-scan-detail.module').then( m => m.InboundScanDetailPageModule)
  },
  {
    path: 'inbound-scan-header',
    loadChildren: () => import('./inbound-scan-crud/inbound-scan-header/inbound-scan-header.module').then( m => m.InboundScanHeaderPageModule)
  },
  {
    path: 'inbound-scan-item',
    loadChildren: () => import('./inbound-scan-crud/inbound-scan-item/inbound-scan-item.module').then( m => m.InboundScanItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboundScanPageRoutingModule {}
