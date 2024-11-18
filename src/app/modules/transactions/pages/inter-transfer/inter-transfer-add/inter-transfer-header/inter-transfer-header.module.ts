import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferHeaderPageRoutingModule } from './inter-transfer-header-routing.module';

import { InterTransferHeaderPage } from './inter-transfer-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferHeaderPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [InterTransferHeaderPage]
})
export class InterTransferHeaderPageModule {}
