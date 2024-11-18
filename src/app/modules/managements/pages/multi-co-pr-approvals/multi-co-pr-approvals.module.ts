import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiCoPrApprovalsPageRoutingModule } from './multi-co-pr-approvals-routing.module';

import { MultiCoPrApprovalsPage } from './multi-co-pr-approvals.page';
import { MultiCoTransactionProcessingPageModule } from 'src/app/shared/pages/multico-transaction-processing/multico-transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      MultiCoPrApprovalsPageRoutingModule,
      MultiCoTransactionProcessingPageModule
   ],
   declarations: [MultiCoPrApprovalsPage]
})
export class MultiCoPrApprovalsPageModule { }
