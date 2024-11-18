import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NonTradePurchaseOrderDetailPageRoutingModule } from './non-trade-purchase-order-detail-routing.module';

import { NonTradePurchaseOrderDetailPage } from './non-trade-purchase-order-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NonTradePurchaseOrderDetailPageRoutingModule,
    SumModule,
    IdMappingModule
  ],
  declarations: [NonTradePurchaseOrderDetailPage]
})
export class NonTradePurchaseOrderDetailPageModule {}
