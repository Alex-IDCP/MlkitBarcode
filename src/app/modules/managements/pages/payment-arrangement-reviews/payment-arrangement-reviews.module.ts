import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentArrangementReviewsPageRoutingModule } from './payment-arrangement-reviews-routing.module';

import { PaymentArrangementReviewsPage } from './payment-arrangement-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      PaymentArrangementReviewsPageRoutingModule,
      TransactionProcessingPageModule
   ],
   declarations: [PaymentArrangementReviewsPage]
})
export class PaymentArrangementReviewsPageModule { }
