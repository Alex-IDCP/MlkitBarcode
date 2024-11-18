import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserReloginPage } from './user-relogin.page';

const routes: Routes = [
  {
    path: '',
    component: UserReloginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserReloginPageRoutingModule {}
