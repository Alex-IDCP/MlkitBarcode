import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchDropdownPageRoutingModule } from './search-dropdown-routing.module';

import { SearchDropdownPage } from './search-dropdown.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchDropdownPageRoutingModule
  ],
  exports: [
    SearchDropdownPage
  ],
  declarations: [SearchDropdownPage]
})
export class SearchDropdownPageModule {}
