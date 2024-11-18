import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorApplicationPageRoutingModule } from './debtor-application-routing.module';

import { DebtorApplicationPage } from './debtor-application.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorApplicationPageRoutingModule
  ],
  declarations: [DebtorApplicationPage]
})
export class DebtorApplicationPageModule {}
