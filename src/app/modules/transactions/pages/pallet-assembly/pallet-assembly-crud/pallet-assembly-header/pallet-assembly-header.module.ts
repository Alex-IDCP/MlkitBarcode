import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PalletAssemblyHeaderPageRoutingModule } from './pallet-assembly-header-routing.module';

import { PalletAssemblyHeaderPage } from './pallet-assembly-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PalletAssemblyHeaderPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [PalletAssemblyHeaderPage]
})
export class PalletAssemblyHeaderPageModule {}
