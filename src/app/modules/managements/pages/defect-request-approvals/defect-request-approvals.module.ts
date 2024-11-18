import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestApprovalsPageRoutingModule } from './defect-request-approvals-routing.module';

import { DefectRequestApprovalsPage } from './defect-request-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefectRequestApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [DefectRequestApprovalsPage]
})
export class DefectRequestApprovalsPageModule {}
