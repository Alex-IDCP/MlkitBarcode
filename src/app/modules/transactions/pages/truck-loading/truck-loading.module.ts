import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckLoadingPageRoutingModule } from './truck-loading-routing.module';

import { TruckLoadingPage } from './truck-loading.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckLoadingPageRoutingModule,
    IdMappingModule
  ],
  declarations: [TruckLoadingPage]
})
export class TruckLoadingPageModule {}
