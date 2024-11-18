import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorLatestOutstandingPageRoutingModule } from './debtor-latest-outstanding-routing.module';

import { DebtorLatestOutstandingPage } from './debtor-latest-outstanding.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorLatestOutstandingPageRoutingModule,
    SearchMultiDropdownPageModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    NgxDatatableModule
  ],
  declarations: [DebtorLatestOutstandingPage]
})
export class DebtorLatestOutstandingPageModule {}
