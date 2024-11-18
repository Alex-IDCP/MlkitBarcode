import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesPage } from './consignment-sales.page';

const routes: Routes = [
   {
      path: '',
      component: ConsignmentSalesPage
   },
   {
      path: 'consignment-sales-header',
      loadChildren: () => import('./consignment-sales-crud/consignment-sales-header/consignment-sales-header.module').then(m => m.ConsignmentSalesHeaderPageModule)
   },
   {
      path: 'consignment-sales-item',
      loadChildren: () => import('./consignment-sales-crud/consignment-sales-item/consignment-sales-item.module').then(m => m.ConsignmentSalesItemPageModule)
   }

];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class ConsignmentSalesPageRoutingModule { }
