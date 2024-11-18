import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishPage } from './stock-replenish.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishPage
  },
  {
    path: 'stock-replenish-header',
    loadChildren: () => import('./stock-replenish-crud/stock-replenish-header/stock-replenish-header.module').then( m => m.StockReplenishHeaderPageModule)
  },
  {
    path: 'stock-replenish-item',
    loadChildren: () => import('./stock-replenish-crud/stock-replenish-item/stock-replenish-item.module').then( m => m.StockReplenishItemPageModule)
  },
  {
    path: 'stock-replenish-cart',
    loadChildren: () => import('./stock-replenish-crud/stock-replenish-cart/stock-replenish-cart.module').then( m => m.StockReplenishCartPageModule)
  },
  {
    path: 'stock-replenish-detail',
    loadChildren: () => import('./stock-replenish-detail/stock-replenish-detail.module').then( m => m.StockReplenishDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishPageRoutingModule {}
