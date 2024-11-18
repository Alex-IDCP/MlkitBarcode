import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSoListingPageRoutingModule } from './rp-so-listing-routing.module';

import { RpSoListingPage } from './rp-so-listing.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSoListingPageRoutingModule,
    NgxDatatableModule,
    SearchMultiDropdownPageModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [RpSoListingPage]
})
export class RpSoListingPageModule {}
