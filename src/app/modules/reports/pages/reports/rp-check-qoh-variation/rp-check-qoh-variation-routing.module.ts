import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpCheckQohVariationPage } from './rp-check-qoh-variation.page';

const routes: Routes = [
  {
    path: '',
    component: RpCheckQohVariationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpCheckQohVariationPageRoutingModule {}
