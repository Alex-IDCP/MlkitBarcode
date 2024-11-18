import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpSoListingPage } from './rp-so-listing.page';

const routes: Routes = [
  {
    path: '',
    component: RpSoListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpSoListingPageRoutingModule {}
