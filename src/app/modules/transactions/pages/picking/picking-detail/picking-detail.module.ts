import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingDetailPageRoutingModule } from './picking-detail-routing.module';

import { PickingDetailPage } from './picking-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingDetailPageRoutingModule,
    IdMappingModule,
    OfflineItemIdMappingModule
  ],
  declarations: [PickingDetailPage]
})
export class PickingDetailPageModule {}
