import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefectRequestHeaderPage } from './defect-request-header.page';

const routes: Routes = [
  {
    path: '',
    component: DefectRequestHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefectRequestHeaderPageRoutingModule {}
