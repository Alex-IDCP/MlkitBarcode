import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PosBillDetailPageRoutingModule } from './pos-bill-detail-routing.module';

import { PosBillDetailPage } from './pos-bill-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PosBillDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PosBillDetailPage]
})
export class PosBillDetailPageModule {}
