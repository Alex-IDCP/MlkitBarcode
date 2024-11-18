import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpCheckCnPage } from './rp-check-cn.page';

const routes: Routes = [
  {
    path: '',
    component: RpCheckCnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpCheckCnPageRoutingModule {}
