import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashDepositPageRoutingModule } from './cash-deposit-routing.module';

import { CashDepositPage } from './cash-deposit.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      CashDepositPageRoutingModule,
      IdMappingModule,
      NgxPaginationModule
   ],
   declarations: [CashDepositPage]
})
export class CashDepositPageModule { }
