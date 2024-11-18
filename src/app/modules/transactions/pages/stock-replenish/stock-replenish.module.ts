import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReplenishPageRoutingModule } from './stock-replenish-routing.module';

import { StockReplenishPage } from './stock-replenish.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReplenishPageRoutingModule
  ],
  declarations: [StockReplenishPage]
})
export class StockReplenishPageModule {}
