import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSalesPerformancePageRoutingModule } from './rp-sales-performance-routing.module';

import { RpSalesPerformancePage } from './rp-sales-performance.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CalendarInputPageModule } from '../../../../../shared/pages/calendar-input/calendar-input.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSalesPerformancePageRoutingModule,
    NgxDatatableModule,
    CalendarInputPageModule,
    SumModule
  ],
  declarations: [RpSalesPerformancePage]
})
export class RpSalesPerformancePageModule {}
