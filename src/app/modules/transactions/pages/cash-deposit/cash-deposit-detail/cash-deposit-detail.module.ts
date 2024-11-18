import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashDepositDetailPageRoutingModule } from './cash-deposit-detail-routing.module';

import { CashDepositDetailPage } from './cash-deposit-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashDepositDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [CashDepositDetailPage]
})
export class CashDepositDetailPageModule {}
