import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentArrangementDetailPageRoutingModule } from './payment-arrangement-detail-routing.module';

import { PaymentArrangementDetailPage } from './payment-arrangement-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdToCodeMappingModule } from 'src/app/shared/pipes/id-to-code-mapping/id-to-code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      PaymentArrangementDetailPageRoutingModule,
      IdMappingModule,
      IdToCodeMappingModule,
      SumModule
   ],
   declarations: [PaymentArrangementDetailPage]
})
export class PaymentArrangementDetailPageModule { }
