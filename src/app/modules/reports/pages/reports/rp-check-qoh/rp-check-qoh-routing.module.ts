import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpCheckQohPage } from './rp-check-qoh.page';

const routes: Routes = [
  {
    path: '',
    component: RpCheckQohPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpCheckQohPageRoutingModule {}
