import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchDropdownPage } from './search-dropdown.page';

const routes: Routes = [
  {
    path: '',
    component: SearchDropdownPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchDropdownPageRoutingModule {}
