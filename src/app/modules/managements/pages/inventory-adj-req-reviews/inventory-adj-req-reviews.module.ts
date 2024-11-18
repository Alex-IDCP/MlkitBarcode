import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryAdjReqReviewsPageRoutingModule } from './inventory-adj-req-reviews-routing.module';

import { InventoryAdjReqReviewsPage } from './inventory-adj-req-reviews.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InventoryAdjReqReviewsPageRoutingModule,
      TransactionProcessingPageModule
   ],
   declarations: [InventoryAdjReqReviewsPage]
})
export class InventoryAdjReqReviewsPageModule { }
