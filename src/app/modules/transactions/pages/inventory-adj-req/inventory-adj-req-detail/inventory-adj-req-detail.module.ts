import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryAdjReqDetailPageRoutingModule } from './inventory-adj-req-detail-routing.module';

import { InventoryAdjReqDetailPage } from './inventory-adj-req-detail.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryAdjReqDetailPageRoutingModule,
      IdMappingModule,
      SumModule,
      CodeMappingModule
   ],
   declarations: [InventoryAdjReqDetailPage]
})
export class InventoryAdjReqDetailPageModule { }
