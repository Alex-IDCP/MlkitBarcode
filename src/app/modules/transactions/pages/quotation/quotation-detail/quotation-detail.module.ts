import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationDetailPageRoutingModule } from './quotation-detail-routing.module';

import { QuotationDetailPage } from './quotation-detail.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from 'src/app/shared/pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      QuotationDetailPageRoutingModule,
      SumModule,
      IdMappingModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule
   ],
   declarations: [QuotationDetailPage]
})
export class QuotationDetailPageModule { }
