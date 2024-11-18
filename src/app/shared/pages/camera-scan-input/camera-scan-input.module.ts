import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraScanInputPageRoutingModule } from './camera-scan-input-routing.module';

import { CameraScanInputPage } from './camera-scan-input.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CameraScanInputPageRoutingModule
  ],
  exports: [
    CameraScanInputPage
  ],
  declarations: [CameraScanInputPage]
})
export class CameraScanInputPageModule {}
