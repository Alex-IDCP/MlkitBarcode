import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountHeaderPageRoutingModule } from './stock-count-header-routing.module';

import { StockCountHeaderPage } from './stock-count-header.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      StockCountHeaderPageRoutingModule,
      CalendarInputPageModule,
      SearchDropdownPageModule,
      IdMappingModule,
      ReactiveFormsModule
   ],
   declarations: [StockCountHeaderPage]
})
export class StockCountHeaderPageModule { }
