import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReplenishCartPageRoutingModule } from './stock-replenish-cart-routing.module';

import { StockReplenishCartPage } from './stock-replenish-cart.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReplenishCartPageRoutingModule,
    SumModule,
    IdMappingModule
  ],
  declarations: [StockReplenishCartPage]
})
export class StockReplenishCartPageModule {}
