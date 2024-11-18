import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountDetailPageRoutingModule } from './stock-count-detail-routing.module';

import { StockCountDetailPage } from './stock-count-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { BinMappingModule } from 'src/app/shared/pipes/bin-mapping/bin-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      StockCountDetailPageRoutingModule,
      IdMappingModule,
      BinMappingModule,
      SumModule,
      NgxPaginationModule
   ],
   declarations: [StockCountDetailPage]
})
export class StockCountDetailPageModule { }
