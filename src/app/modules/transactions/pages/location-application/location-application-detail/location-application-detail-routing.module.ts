import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationApplicationDetailPage } from './location-application-detail.page';

const routes: Routes = [
  {
    path: '',
    component: LocationApplicationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationApplicationDetailPageRoutingModule {}
