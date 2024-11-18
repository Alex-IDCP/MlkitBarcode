import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestItemPage } from './defect-request-item.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestItemPageRoutingModule {}
