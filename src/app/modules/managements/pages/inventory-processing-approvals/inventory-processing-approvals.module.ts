import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryProcessingApprovalsPageRoutingModule } from './inventory-processing-approvals-routing.module';

import { InventoryProcessingApprovalsPage } from './inventory-processing-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryProcessingApprovalsPageRoutingModule,
      TransactionProcessingPageModule
   ],
   declarations: [InventoryProcessingApprovalsPage]
})
export class InventoryProcessingApprovalsPageModule { }
