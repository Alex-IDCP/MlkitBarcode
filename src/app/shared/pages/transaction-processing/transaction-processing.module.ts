import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionProcessingPageRoutingModule } from './transaction-processing-routing.module';

import { TransactionProcessingPage } from './transaction-processing.page';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      TransactionProcessingPageRoutingModule
   ],
   exports: [
      TransactionProcessingPage
   ],
   declarations: [TransactionProcessingPage]
})
export class TransactionProcessingPageModule { }
