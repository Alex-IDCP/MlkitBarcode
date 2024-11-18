import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationPage } from './quotation.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationPage
  },
  {
    path: 'quotation-header',
    loadChildren: () => import('./quotation-add/quotation-header/quotation-header.module').then(m => m.QuotationHeaderPageModule)
  },
  {
    path: 'quotation-item',
    loadChildren: () => import('./quotation-add/quotation-item/quotation-item.module').then(m => m.QuotationItemPageModule)
  },
  {
    path: 'quotation-cart',
    loadChildren: () => import('./quotation-add/quotation-cart/quotation-cart.module').then( m => m.QuotationCartPageModule)
  },
  {
    path: 'quotation-summary',
    loadChildren: () => import('./quotation-add/quotation-summary/quotation-summary.module').then(m => m.QuotationSummaryPageModule)
  },
  {
    path: 'quotation-detail',
    loadChildren: () => import('./quotation-detail/quotation-detail.module').then( m => m.QuotationDetailPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationPageRoutingModule {}
