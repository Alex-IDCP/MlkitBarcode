import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestCartPage } from './defect-request-cart.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestCartPageRoutingModule {}
