import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckLoadingAddPage } from './truck-loading-add.page';

const routes: Routes = [
  {
    path: '',
    component: TruckLoadingAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckLoadingAddPageRoutingModule {}
