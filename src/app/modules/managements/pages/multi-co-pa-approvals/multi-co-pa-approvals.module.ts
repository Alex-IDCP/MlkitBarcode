import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiCoPaApprovalsPageRoutingModule } from './multi-co-pa-approvals-routing.module';

import { MultiCoPaApprovalsPage } from './multi-co-pa-approvals.page';
import { MultiCoTransactionProcessingPageModule } from 'src/app/shared/pages/multico-transaction-processing/multico-transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiCoPaApprovalsPageRoutingModule,
    MultiCoTransactionProcessingPageModule
  ],
  declarations: [MultiCoPaApprovalsPage]
})
export class MultiCoPaApprovalsPageModule {}
