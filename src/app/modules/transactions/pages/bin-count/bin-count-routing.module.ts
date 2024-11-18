import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BinCountPage } from './bin-count.page';

const routes: Routes = [
  {
    path: '',
    component: BinCountPage
  },
  {
    path: 'bin-count-header',
    loadChildren: () => import('./bin-count-crud/bin-count-header/bin-count-header.module').then( m => m.BinCountHeaderPageModule)
  },
  {
    path: 'bin-count-item',
    loadChildren: () => import('./bin-count-crud/bin-count-item/bin-count-item.module').then( m => m.BinCountItemPageModule)
  },
  {
    path: 'bin-count-detail',
    loadChildren: () => import('./bin-count-detail/bin-count-detail.module').then( m => m.BinCountDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BinCountPageRoutingModule {}
