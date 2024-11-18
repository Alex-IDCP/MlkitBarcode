import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountDetailPage } from './consignment-count-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountDetailPageRoutingModule {}
