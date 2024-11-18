import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseReqDetailPageRoutingModule } from './purchase-req-detail-routing.module';

import { PurchaseReqDetailPage } from './purchase-req-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseReqDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [PurchaseReqDetailPage]
})
export class PurchaseReqDetailPageModule {}
