import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInScanningItemPageRoutingModule } from './transfer-in-scanning-item-routing.module';

import { TransferInScanningItemPage } from './transfer-in-scanning-item.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInScanningItemPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule,
    SumModule,
    CodeMappingModule
  ],
  declarations: [TransferInScanningItemPage]
})
export class TransferInScanningItemPageModule {}
