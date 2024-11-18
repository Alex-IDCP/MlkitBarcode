import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationItemPage } from './quotation-item.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationItemPageRoutingModule {}
