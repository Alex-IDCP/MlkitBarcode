import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtpConfigListPageRoutingModule } from './otp-config-list-routing.module';

import { OtpConfigListPage } from './otp-config-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtpConfigListPageRoutingModule
  ],
  declarations: [OtpConfigListPage]
})
export class OtpConfigListPageModule {}
