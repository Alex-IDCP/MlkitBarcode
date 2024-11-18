import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExchangeApprovalsPageRoutingModule } from './exchange-approvals-routing.module';

import { ExchangeApprovalsPage } from './exchange-approvals.page';
import { PosApprovalProcessingPageModule } from 'src/app/shared/pages/pos-approval-processing/pos-approval-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExchangeApprovalsPageRoutingModule,
    PosApprovalProcessingPageModule
  ],
  declarations: [ExchangeApprovalsPage]
})
export class ExchangeApprovalsPageModule {}
