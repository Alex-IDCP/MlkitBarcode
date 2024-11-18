import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarcodeScanInputPage } from './barcode-scan-input.page';

const routes: Routes = [
  {
    path: '',
    component: BarcodeScanInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarcodeScanInputPageRoutingModule {}
