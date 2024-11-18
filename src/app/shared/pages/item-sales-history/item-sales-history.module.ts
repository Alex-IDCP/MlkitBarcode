import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemSalesHistoryPageRoutingModule } from './item-sales-history-routing.module';

import { ItemSalesHistoryPage } from './item-sales-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemSalesHistoryPageRoutingModule
  ],
  declarations: [ItemSalesHistoryPage]
})
export class ItemSalesHistoryPageModule {}
