import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesHeaderPageRoutingModule } from './consignment-sales-header-routing.module';

import { ConsignmentSalesHeaderPage } from './consignment-sales-header.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesHeaderPageRoutingModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [ConsignmentSalesHeaderPage]
})
export class ConsignmentSalesHeaderPageModule {}
