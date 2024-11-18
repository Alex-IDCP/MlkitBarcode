import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReplenishDetailPageRoutingModule } from './stock-replenish-detail-routing.module';

import { StockReplenishDetailPage } from './stock-replenish-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReplenishDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [StockReplenishDetailPage]
})
export class StockReplenishDetailPageModule {}
