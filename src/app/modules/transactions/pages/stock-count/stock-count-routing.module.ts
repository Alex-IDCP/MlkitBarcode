import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountPage } from './stock-count.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountPage
  },
  {
    path: 'stock-count-crud/stock-count-header',
    loadChildren: () => import('./stock-count-crud/stock-count-header/stock-count-header.module').then( m => m.StockCountHeaderPageModule)
  },
  {
    path: 'stock-count-crud/stock-count-item',
    loadChildren: () => import('./stock-count-crud/stock-count-item/stock-count-item.module').then( m => m.StockCountItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountPageRoutingModule {}
