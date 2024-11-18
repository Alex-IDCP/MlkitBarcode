import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PalletAssemblyPageRoutingModule } from './pallet-assembly-routing.module';

import { PalletAssemblyPage } from './pallet-assembly.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PalletAssemblyPageRoutingModule,
    IdMappingModule,
    NgxPaginationModule
  ],
  declarations: [PalletAssemblyPage]
})
export class PalletAssemblyPageModule {}
