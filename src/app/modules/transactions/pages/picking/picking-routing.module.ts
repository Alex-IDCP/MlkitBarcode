import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingPage } from './picking.page';

const routes: Routes = [
  {
    path: '',
    component: PickingPage
  },
  {
    path: 'picking-header',
    loadChildren: () => import('./picking-add/picking-header/picking-header.module').then( m => m.PickingHeaderPageModule)
  },
  {
    path: 'picking-item',
    loadChildren: () => import('./picking-add/picking-item/picking-item.module').then( m => m.PickingItemPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingPageRoutingModule {}
