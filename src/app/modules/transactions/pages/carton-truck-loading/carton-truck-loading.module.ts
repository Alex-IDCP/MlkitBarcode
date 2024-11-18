import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonTruckLoadingPageRoutingModule } from './carton-truck-loading-routing.module';

import { CartonTruckLoadingPage } from './carton-truck-loading.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartonTruckLoadingPageRoutingModule
  ],
  declarations: [CartonTruckLoadingPage]
})
export class CartonTruckLoadingPageModule {}
