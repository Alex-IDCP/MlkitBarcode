import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckLoadingAddPageRoutingModule } from './truck-loading-add-routing.module';

import { TruckLoadingAddPage } from './truck-loading-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckLoadingAddPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TruckLoadingAddPage]
})
export class TruckLoadingAddPageModule {}
