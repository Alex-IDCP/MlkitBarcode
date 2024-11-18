import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryAdjReqApprovalsPageRoutingModule } from './inventory-adj-req-approvals-routing.module';

import { InventoryAdjReqApprovalsPage } from './inventory-adj-req-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryAdjReqApprovalsPageRoutingModule,
      TransactionProcessingPageModule
   ],
   declarations: [InventoryAdjReqApprovalsPage]
})
export class InventoryAdjReqApprovalsPageModule { }
