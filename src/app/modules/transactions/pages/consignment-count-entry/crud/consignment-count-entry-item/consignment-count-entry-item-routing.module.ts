import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountEntryItemPage } from './consignment-count-entry-item.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountEntryItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountEntryItemPageRoutingModule {}
