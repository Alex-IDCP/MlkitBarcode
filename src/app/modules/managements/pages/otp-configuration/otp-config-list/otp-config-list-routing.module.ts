import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtpConfigListPage } from './otp-config-list.page';

const routes: Routes = [
  {
    path: '',
    component: OtpConfigListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtpConfigListPageRoutingModule {}
