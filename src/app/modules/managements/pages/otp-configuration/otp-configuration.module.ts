import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtpConfigurationPageRoutingModule } from './otp-configuration-routing.module';

import { OtpConfigurationPage } from './otp-configuration.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtpConfigurationPageRoutingModule,
    SearchDropdownPageModule,
    SearchMultiDropdownPageModule,
    CalendarInputPageModule
  ],
  declarations: [OtpConfigurationPage]
})
export class OtpConfigurationPageModule {}
