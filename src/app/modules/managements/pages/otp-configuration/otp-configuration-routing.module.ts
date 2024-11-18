import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtpConfigurationPage } from './otp-configuration.page';

const routes: Routes = [
  {
    path: '',
    component: OtpConfigurationPage
  },
  {
    path: 'otp-config-list',
    loadChildren: () => import('./otp-config-list/otp-config-list.module').then( m => m.OtpConfigListPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtpConfigurationPageRoutingModule {}
