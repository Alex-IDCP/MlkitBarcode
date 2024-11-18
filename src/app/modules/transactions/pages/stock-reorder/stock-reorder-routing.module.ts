import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderPage } from './stock-reorder.page';

const routes: Routes = [
   {
      path: '',
      component: StockReorderPage
   },
   {
      path: 'stock-reorder-detail',
      loadChildren: () => import('./stock-reorder-detail/stock-reorder-detail.module').then(m => m.StockReorderDetailPageModule)
   },
   {
      path: 'stock-reorder-header',
      loadChildren: () => import('./stock-reorder-crud/stock-reorder-header/stock-reorder-header.module').then(m => m.StockReorderHeaderPageModule)
   },
   {
      path: 'stock-reorder-item',
      loadChildren: () => import('./stock-reorder-crud/stock-reorder-item/stock-reorder-item.module').then(m => m.StockReorderItemPageModule)
   },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class StockReorderPageRoutingModule { }
