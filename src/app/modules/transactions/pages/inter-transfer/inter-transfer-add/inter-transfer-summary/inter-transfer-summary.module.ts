import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferSummaryPageRoutingModule } from './inter-transfer-summary-routing.module';

import { InterTransferSummaryPage } from './inter-transfer-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferSummaryPageRoutingModule
  ],
  declarations: [InterTransferSummaryPage]
})
export class InterTransferSummaryPageModule {}
