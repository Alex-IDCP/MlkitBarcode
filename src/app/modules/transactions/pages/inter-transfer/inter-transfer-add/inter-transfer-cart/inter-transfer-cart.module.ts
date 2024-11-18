import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferCartPageRoutingModule } from './inter-transfer-cart-routing.module';

import { InterTransferCartPage } from './inter-transfer-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferCartPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [InterTransferCartPage]
})
export class InterTransferCartPageModule {}
