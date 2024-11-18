import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarInputPageRoutingModule } from './calendar-input-routing.module';

import { CalendarInputPage } from './calendar-input.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarInputPageRoutingModule
  ],
  exports: [
    CalendarInputPage
  ],
  declarations: [CalendarInputPage]
})
export class CalendarInputPageModule {}
