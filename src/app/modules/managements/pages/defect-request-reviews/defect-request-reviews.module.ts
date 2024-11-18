import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestReviewsPageRoutingModule } from './defect-request-reviews-routing.module';

import { DefectRequestReviewsPage } from './defect-request-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefectRequestReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [DefectRequestReviewsPage]
})
export class DefectRequestReviewsPageModule {}
