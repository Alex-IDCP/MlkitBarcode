import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountItemPage } from './consignment-count-item.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountItemPageRoutingModule {}
