import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReplenishItemPageRoutingModule } from './stock-replenish-item-routing.module';

import { StockReplenishItemPage } from './stock-replenish-item.page';
import { ItemCatalogPageModule } from 'src/app/shared/pages/item-catalog/item-catalog.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReplenishItemPageRoutingModule,
    ItemCatalogPageModule
  ],
  declarations: [StockReplenishItemPage]
})
export class StockReplenishItemPageModule {}
