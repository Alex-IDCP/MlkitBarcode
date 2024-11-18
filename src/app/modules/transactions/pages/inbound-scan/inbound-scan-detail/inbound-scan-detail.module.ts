import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanDetailPageRoutingModule } from './inbound-scan-detail-routing.module';

import { InboundScanDetailPage } from './inbound-scan-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InboundScanDetailPageRoutingModule,
      IdMappingModule,
      CodeMappingModule,
      OfflineItemIdMappingModule,
      SumModule
   ],
   declarations: [InboundScanDetailPage]
})
export class InboundScanDetailPageModule { }
