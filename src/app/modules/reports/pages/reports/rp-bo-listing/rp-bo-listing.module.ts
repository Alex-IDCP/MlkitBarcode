import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpBoListingPageRoutingModule } from './rp-bo-listing-routing.module';

import { RpBoListingPage } from './rp-bo-listing.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      RpBoListingPageRoutingModule,
      NgxDatatableModule,
      SearchMultiDropdownPageModule,
      CalendarInputPageModule,
      SearchDropdownPageModule
   ],
   declarations: [RpBoListingPage]
})
export class RpBoListingPageModule { }
