import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackToBackOrderPageRoutingModule } from './backtoback-order-routing.module';

import { BackToBackOrderPage } from './backtoback-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackToBackOrderPageRoutingModule
  ],
  declarations: [BackToBackOrderPage]
})
export class BackToBackOrderPageModule {}
