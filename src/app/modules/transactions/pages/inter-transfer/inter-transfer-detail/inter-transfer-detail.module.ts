import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferDetailPageRoutingModule } from './inter-transfer-detail-routing.module';

import { InterTransferDetailPage } from './inter-transfer-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [InterTransferDetailPage]
})
export class InterTransferDetailPageModule {}
