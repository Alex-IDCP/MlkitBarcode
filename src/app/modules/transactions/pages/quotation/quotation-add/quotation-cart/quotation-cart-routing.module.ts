import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationCartPage } from './quotation-cart.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationCartPageRoutingModule {}
