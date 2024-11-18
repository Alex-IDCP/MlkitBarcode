import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountEntryHeaderPage } from './consignment-count-entry-header.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountEntryHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountEntryHeaderPageRoutingModule {}
