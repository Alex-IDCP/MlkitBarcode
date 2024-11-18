import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneralScanInputPage } from './general-scan-input.page';

const routes: Routes = [
  {
    path: '',
    component: GeneralScanInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralScanInputPageRoutingModule {}
