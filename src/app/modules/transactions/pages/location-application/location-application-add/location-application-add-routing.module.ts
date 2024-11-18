import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationApplicationAddPage } from './location-application-add.page';

const routes: Routes = [
  {
    path: '',
    component: LocationApplicationAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationApplicationAddPageRoutingModule {}
