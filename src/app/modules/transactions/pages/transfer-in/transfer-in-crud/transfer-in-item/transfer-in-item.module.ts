import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInItemPageRoutingModule } from './transfer-in-item-routing.module';

import { TransferInItemPage } from './transfer-in-item.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInItemPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule
  ],
  declarations: [TransferInItemPage]
})
export class TransferInItemPageModule {}
