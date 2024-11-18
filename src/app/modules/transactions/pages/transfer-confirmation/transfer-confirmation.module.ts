import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferConfirmationPageRoutingModule } from './transfer-confirmation-routing.module';

import { TransferConfirmationPage } from './transfer-confirmation.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferConfirmationPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule
  ],
  declarations: [TransferConfirmationPage]
})
export class TransferConfirmationPageModule {}
