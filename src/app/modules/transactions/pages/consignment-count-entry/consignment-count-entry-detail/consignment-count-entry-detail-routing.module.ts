import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountEntryDetailPage } from './consignment-count-entry-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountEntryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountEntryDetailPageRoutingModule {}
