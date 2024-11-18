import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashDepositAddPageRoutingModule } from './cash-deposit-add-routing.module';

import { CashDepositAddPage } from './cash-deposit-add.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashDepositAddPageRoutingModule,
    ReactiveFormsModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [CashDepositAddPage]
})
export class CashDepositAddPageModule {}
