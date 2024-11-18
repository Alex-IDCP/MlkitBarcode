import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BranchReceivingReviewsPageRoutingModule } from './branch-receiving-reviews-routing.module';

import { BranchReceivingReviewsPage } from './branch-receiving-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BranchReceivingReviewsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [BranchReceivingReviewsPage]
})
export class BranchReceivingReviewsPageModule {}
