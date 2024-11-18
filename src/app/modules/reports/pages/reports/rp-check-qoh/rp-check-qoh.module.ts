import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpCheckQohPageRoutingModule } from './rp-check-qoh-routing.module';

import { RpCheckQohPage } from './rp-check-qoh.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpCheckQohPageRoutingModule,
    NgxDatatableModule,
    BarcodeScanInputPageModule
  ],
  declarations: [RpCheckQohPage]
})
export class RpCheckQohPageModule {}
