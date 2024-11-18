import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseReqDetailPageRoutingModule } from './non-trade-purchase-req-detail-routing.module';

import { NonTradePurchaseReqDetailPage } from './non-trade-purchase-req-detail.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseReqDetailPageRoutingModule,
    SumModule,
    IdMappingModule
  ],
  declarations: [NonTradePurchaseReqDetailPage]
})
export class NonTradePurchaseReqDetailPageModule {}
