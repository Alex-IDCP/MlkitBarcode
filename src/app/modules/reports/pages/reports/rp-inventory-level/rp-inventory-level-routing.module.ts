import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpInventoryLevelPage } from './rp-inventory-level.page';

const routes: Routes = [
  {
    path: '',
    component: RpInventoryLevelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpInventoryLevelPageRoutingModule {}
