import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferBinPageRoutingModule } from './transfer-bin-routing.module';

import { TransferBinPage } from './transfer-bin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferBinPageRoutingModule
  ],
  declarations: [TransferBinPage]
})
export class TransferBinPageModule {}
