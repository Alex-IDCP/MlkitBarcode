import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PalletAssemblyDetailPageRoutingModule } from './pallet-assembly-detail-routing.module';

import { PalletAssemblyDetailPage } from './pallet-assembly-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PalletAssemblyDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PalletAssemblyDetailPage]
})
export class PalletAssemblyDetailPageModule {}
