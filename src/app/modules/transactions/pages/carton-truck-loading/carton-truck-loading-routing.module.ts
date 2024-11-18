import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartonTruckLoadingPage } from './carton-truck-loading.page';

const routes: Routes = [
   {
      path: '',
      component: CartonTruckLoadingPage
   },
   {
      path: 'carton-truck-loading-detail',
      loadChildren: () => import('./carton-truck-loading-detail/carton-truck-loading-detail.module').then(m => m.CartonTruckLoadingDetailPageModule)
   },
   {
      path: 'carton-truck-loading-header',
      loadChildren: () => import('./carton-truck-loading-crud/carton-truck-loading-header/carton-truck-loading-header.module').then(m => m.CartonTruckLoadingHeaderPageModule)
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class CartonTruckLoadingPageRoutingModule { }
