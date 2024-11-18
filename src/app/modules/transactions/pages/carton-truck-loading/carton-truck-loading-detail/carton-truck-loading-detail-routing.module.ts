import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartonTruckLoadingDetailPage } from './carton-truck-loading-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CartonTruckLoadingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartonTruckLoadingDetailPageRoutingModule {}
