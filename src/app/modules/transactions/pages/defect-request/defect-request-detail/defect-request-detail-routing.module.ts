import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestDetailPage } from './defect-request-detail.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestDetailPageRoutingModule {}
