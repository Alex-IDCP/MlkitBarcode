import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CameraScanInputPage } from './camera-scan-input.page';

const routes: Routes = [
  {
    path: '',
    component: CameraScanInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CameraScanInputPageRoutingModule {}
