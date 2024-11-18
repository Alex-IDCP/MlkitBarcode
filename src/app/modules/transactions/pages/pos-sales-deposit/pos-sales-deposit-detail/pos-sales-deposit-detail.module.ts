import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PosSalesDepositDetailPageRoutingModule } from './pos-sales-deposit-detail-routing.module';

import { PosSalesDepositDetailPage } from './pos-sales-deposit-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PosSalesDepositDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PosSalesDepositDetailPage]
})
export class PosSalesDepositDetailPageModule {}
