import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonTruckLoadingDetailPageRoutingModule } from './carton-truck-loading-detail-routing.module';

import { CartonTruckLoadingDetailPage } from './carton-truck-loading-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { IdToCodeMappingModule } from 'src/app/shared/pipes/id-to-code-mapping/id-to-code-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      CartonTruckLoadingDetailPageRoutingModule,
      IdMappingModule,
      CodeMappingModule
   ],
   declarations: [CartonTruckLoadingDetailPage]
})
export class CartonTruckLoadingDetailPageModule { }
