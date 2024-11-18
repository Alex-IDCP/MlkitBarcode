import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseOrderDetailPageRoutingModule } from './purchase-order-detail-routing.module';

import { PurchaseOrderDetailPage } from './purchase-order-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseOrderDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [PurchaseOrderDetailPage]
})
export class PurchaseOrderDetailPageModule {}
