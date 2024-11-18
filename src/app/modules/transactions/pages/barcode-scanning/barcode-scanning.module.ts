import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';

import { SharedTestingModule } from '@tests/modules/shared-testing.module';

import { BarcodeScanningRoutingModule } from './barcode-scanning-routing.module';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanningPage } from './barcode-scanning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BarcodeScanningRoutingModule,
  ],
  declarations: [BarcodeScanningPage, BarcodeScanningModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BarcodeScanningModule {}