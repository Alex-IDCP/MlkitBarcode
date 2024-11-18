import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckLoadingDetailPageRoutingModule } from './truck-loading-detail-routing.module';

import { TruckLoadingDetailPage } from './truck-loading-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckLoadingDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [TruckLoadingDetailPage]
})
export class TruckLoadingDetailPageModule {}
