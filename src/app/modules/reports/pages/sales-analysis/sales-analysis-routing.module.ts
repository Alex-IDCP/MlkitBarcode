import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesAnalysisPage } from './sales-analysis.page';

const routes: Routes = [
  {
    path: '',
    component: SalesAnalysisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesAnalysisPageRoutingModule {}
