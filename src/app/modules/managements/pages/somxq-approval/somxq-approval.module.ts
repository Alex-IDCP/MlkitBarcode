import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SomxqApprovalPageRoutingModule } from './somxq-approval-routing.module';

import { SomxqApprovalPage } from './somxq-approval.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SomxqApprovalPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SomxqApprovalPage]
})
export class SomxqApprovalPageModule {}
