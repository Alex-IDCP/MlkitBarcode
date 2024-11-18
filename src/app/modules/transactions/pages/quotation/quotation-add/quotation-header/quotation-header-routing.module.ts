import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationHeaderPage } from './quotation-header.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationHeaderPageRoutingModule {}
