import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutItemPageRoutingModule } from './transfer-out-item-routing.module';

import { TransferOutItemPage } from './transfer-out-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferOutItemPageRoutingModule,
    BarcodeScanInputPageModule,
    SumModule
  ],
  declarations: [TransferOutItemPage]
})
export class TransferOutItemPageModule {}
