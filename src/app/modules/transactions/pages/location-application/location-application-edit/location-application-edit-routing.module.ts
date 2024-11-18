import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationApplicationEditPage } from './location-application-edit.page';

const routes: Routes = [
  {
    path: '',
    component: LocationApplicationEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationApplicationEditPageRoutingModule {}
