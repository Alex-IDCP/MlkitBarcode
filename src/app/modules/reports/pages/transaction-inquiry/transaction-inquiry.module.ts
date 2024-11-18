import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionInquiryPageRoutingModule } from './transaction-inquiry-routing.module';

import { TransactionInquiryPage } from './transaction-inquiry.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionInquiryPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    NgxDatatableModule,
  ],
  declarations: [TransactionInquiryPage]
})
export class TransactionInquiryPageModule {}
