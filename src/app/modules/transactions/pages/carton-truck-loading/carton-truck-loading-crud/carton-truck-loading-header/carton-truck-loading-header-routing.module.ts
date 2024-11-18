import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartonTruckLoadingHeaderPage } from './carton-truck-loading-header.page';

const routes: Routes = [
  {
    path: '',
    component: CartonTruckLoadingHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartonTruckLoadingHeaderPageRoutingModule {}
