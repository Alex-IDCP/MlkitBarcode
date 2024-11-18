import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountDetailPageRoutingModule } from './consignment-count-detail-routing.module';

import { ConsignmentCountDetailPage } from './consignment-count-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentCountDetailPageRoutingModule,
    IdMappingModule,
    SumModule,
    NgxPaginationModule
  ],
  declarations: [ConsignmentCountDetailPage]
})
export class ConsignmentCountDetailPageModule {}
