import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutDetailPageRoutingModule } from './transfer-out-detail-routing.module';

import { TransferOutDetailPage } from './transfer-out-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferOutDetailPageRoutingModule,
    IdMappingModule,
    CodeMappingModule,
    SumModule
  ],
  declarations: [TransferOutDetailPage]
})
export class TransferOutDetailPageModule {}
