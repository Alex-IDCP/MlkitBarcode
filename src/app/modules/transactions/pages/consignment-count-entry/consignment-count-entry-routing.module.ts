import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentCountEntryPage } from './consignment-count-entry.page';

const routes: Routes = [
   {
      path: '',
      component: ConsignmentCountEntryPage
   },
   {
      path: 'consignment-count-entry-header',
      loadChildren: () => import('./crud/consignment-count-entry-header/consignment-count-entry-header.module').then(m => m.ConsignmentCountEntryHeaderPageModule)
   },
   {
      path: 'consignment-count-entry-item',
      loadChildren: () => import('./crud/consignment-count-entry-item/consignment-count-entry-item.module').then(m => m.ConsignmentCountEntryItemPageModule)
   },
   {
      path: 'consignment-count-entry-detail',
      loadChildren: () => import('./consignment-count-entry-detail/consignment-count-entry-detail.module').then(m => m.ConsignmentCountEntryDetailPageModule)
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class ConsignmentCountEntryPageRoutingModule { }
