import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckLoadingPage } from './truck-loading.page';

const routes: Routes = [
  {
    path: '',
    component: TruckLoadingPage
  },
  {
    path: 'truck-loading-detail',
    loadChildren: () => import('./truck-loading-detail/truck-loading-detail.module').then( m => m.TruckLoadingDetailPageModule)
  },
  {
    path: 'truck-loading-add',
    loadChildren: () => import('./truck-loading-add/truck-loading-add.module').then( m => m.TruckLoadingAddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckLoadingPageRoutingModule {}
