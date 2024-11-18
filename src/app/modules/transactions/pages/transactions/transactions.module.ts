import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    ListingSkeletonPageModule
  ],
  declarations: [TransactionsPage]
})
export class TransactionsPageModule {}
