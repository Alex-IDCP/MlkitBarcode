import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BacktobackOrderDetailPageRoutingModule } from './backtoback-order-detail-routing.module';

import { BacktobackOrderDetailPage } from './backtoback-order-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from 'src/app/shared/pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      BacktobackOrderDetailPageRoutingModule,
      IdMappingModule,
      SumModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule,
      CodeMappingModule
   ],
   declarations: [BacktobackOrderDetailPage]
})
export class BacktobackOrderDetailPageModule { }
