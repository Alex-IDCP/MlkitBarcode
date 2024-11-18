import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorApplicationPage } from './creditor-application.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorApplicationPage
  },
  {
    path: 'creditor-application-add',
    loadChildren: () => import('./creditor-application-add/creditor-application-add.module').then( m => m.CreditorApplicationAddPageModule)
  },
  {
    path: 'creditor-application-detail',
    loadChildren: () => import('./creditor-application-detail/creditor-application-detail.module').then( m => m.CreditorApplicationDetailPageModule)
  },
  {
    path: 'creditor-application-edit',
    loadChildren: () => import('./creditor-application-edit/creditor-application-edit.module').then( m => m.CreditorApplicationEditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorApplicationPageRoutingModule {}
