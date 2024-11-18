import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountEntryDetailPageRoutingModule } from './consignment-count-entry-detail-routing.module';

import { ConsignmentCountEntryDetailPage } from './consignment-count-entry-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from 'src/app/shared/pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ConsignmentCountEntryDetailPageRoutingModule,
      IdMappingModule,
      SumModule,
      NgxPaginationModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule
   ],
   declarations: [ConsignmentCountEntryDetailPage]
})
export class ConsignmentCountEntryDetailPageModule { }
