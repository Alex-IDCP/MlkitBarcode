import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountHeaderPage } from './consignment-count-header.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentCountHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentCountHeaderPageRoutingModule {}
