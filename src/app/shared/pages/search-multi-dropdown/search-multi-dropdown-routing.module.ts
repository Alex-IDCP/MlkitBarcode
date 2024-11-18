import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchMultiDropdownPage } from './search-multi-dropdown.page';

const routes: Routes = [
  {
    path: '',
    component: SearchMultiDropdownPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchMultiDropdownPageRoutingModule {}
