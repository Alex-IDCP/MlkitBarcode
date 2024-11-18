import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditorApplicationPageRoutingModule } from './creditor-application-routing.module';

import { CreditorApplicationPage } from './creditor-application.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditorApplicationPageRoutingModule,
  ],
  declarations: [CreditorApplicationPage]
})
export class CreditorApplicationPageModule {}
