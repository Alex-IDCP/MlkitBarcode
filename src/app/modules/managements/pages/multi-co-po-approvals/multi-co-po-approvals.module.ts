import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiCoPoApprovalsPageRoutingModule } from './multi-co-po-approvals-routing.module';

import { MultiCoPoApprovalsPage } from './multi-co-po-approvals.page';
import { MultiCoTransactionProcessingPageModule } from 'src/app/shared/pages/multico-transaction-processing/multico-transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      MultiCoPoApprovalsPageRoutingModule,
      MultiCoTransactionProcessingPageModule
   ],
   declarations: [MultiCoPoApprovalsPage]
})
export class MultiCoPoApprovalsPageModule { }
