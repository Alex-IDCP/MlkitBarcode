import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationApplicationPage } from './location-application.page';

const routes: Routes = [
  {
    path: '',
    component: LocationApplicationPage
  },
  {
    path: 'location-application-add',
    loadChildren: () => import('./location-application-add/location-application-add.module').then( m => m.LocationApplicationAddPageModule)
  },
  {
    path: 'location-application-edit',
    loadChildren: () => import('./location-application-edit/location-application-edit.module').then( m => m.LocationApplicationEditPageModule)
  },
  {
    path: 'location-application-detail',
    loadChildren: () => import('./location-application-detail/location-application-detail.module').then( m => m.LocationApplicationDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationApplicationPageRoutingModule {}
