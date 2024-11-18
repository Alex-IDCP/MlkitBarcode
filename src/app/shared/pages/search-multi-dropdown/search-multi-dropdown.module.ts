import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchMultiDropdownPageRoutingModule } from './search-multi-dropdown-routing.module';

import { SearchMultiDropdownPage } from './search-multi-dropdown.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchMultiDropdownPageRoutingModule
  ],
  exports: [
    SearchMultiDropdownPage
  ],
  declarations: [SearchMultiDropdownPage]
})
export class SearchMultiDropdownPageModule {}
