import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferBinDetailPageRoutingModule } from './transfer-bin-detail-routing.module';

import { TransferBinDetailPage } from './transfer-bin-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferBinDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [TransferBinDetailPage]
})
export class TransferBinDetailPageModule {}
