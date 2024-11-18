import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanPageRoutingModule } from './inbound-scan-routing.module';

import { InboundScanPage } from './inbound-scan.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InboundScanPageRoutingModule,
      NgxPaginationModule
   ],
   declarations: [InboundScanPage]
})
export class InboundScanPageModule { }
