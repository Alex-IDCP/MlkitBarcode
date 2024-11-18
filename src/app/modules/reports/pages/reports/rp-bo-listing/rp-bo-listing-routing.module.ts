import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpBoListingPage } from './rp-bo-listing.page';

const routes: Routes = [
  {
    path: '',
    component: RpBoListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpBoListingPageRoutingModule {}
