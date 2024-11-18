import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInScanningDetailPageRoutingModule } from './transfer-in-scanning-detail-routing.module';

import { TransferInScanningDetailPage } from './transfer-in-scanning-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInScanningDetailPageRoutingModule,
    IdMappingModule,
    SumModule,
    CodeMappingModule
  ],
  declarations: [TransferInScanningDetailPage]
})
export class TransferInScanningDetailPageModule {}
