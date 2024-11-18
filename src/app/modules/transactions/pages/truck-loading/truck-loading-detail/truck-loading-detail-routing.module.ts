import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckLoadingDetailPage } from './truck-loading-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TruckLoadingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckLoadingDetailPageRoutingModule {}
