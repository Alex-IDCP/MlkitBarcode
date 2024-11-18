import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderHeaderPage } from './stock-reorder-header.page';

const routes: Routes = [
   {
      path: '',
      component: StockReorderHeaderPage
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class StockReorderHeaderPageRoutingModule { }
