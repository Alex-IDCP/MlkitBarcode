import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BinCountDetailPageRoutingModule } from './bin-count-detail-routing.module';

import { BinCountDetailPage } from './bin-count-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BinCountDetailPageRoutingModule,
    IdMappingModule,
    SumModule,
    NgxPaginationModule
  ],
  declarations: [BinCountDetailPage]
})
export class BinCountDetailPageModule {}
