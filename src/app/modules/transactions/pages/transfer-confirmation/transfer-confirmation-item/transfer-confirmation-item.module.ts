import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferConfirmationItemPageRoutingModule } from './transfer-confirmation-item-routing.module';

import { TransferConfirmationItemPage } from './transfer-confirmation-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferConfirmationItemPageRoutingModule,
    BarcodeScanInputPageModule
  ],
  declarations: [TransferConfirmationItemPage]
})
export class TransferConfirmationItemPageModule {}
