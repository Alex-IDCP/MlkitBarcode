import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryCountProcessingDetailPageRoutingModule } from './inventory-count-processing-detail-routing.module';

import { InventoryCountProcessingDetailPage } from './inventory-count-processing-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryCountProcessingDetailPageRoutingModule,
      IdMappingModule
   ],
   declarations: [InventoryCountProcessingDetailPage]
})
export class InventoryCountProcessingDetailPageModule { }
