import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSalesCustomerPageRoutingModule } from './rp-sales-customer-routing.module';

import { RpSalesCustomerPage } from './rp-sales-customer.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSalesCustomerPageRoutingModule,
    SearchMultiDropdownPageModule,
    CalendarInputPageModule,
    NgxDatatableModule,
    SumModule
  ],
  declarations: [RpSalesCustomerPage]
})
export class RpSalesCustomerPageModule {}
