import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingHeaderPageRoutingModule } from './packing-header-routing.module';

import { PackingHeaderPage } from './packing-header.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import HideKeyboardModule from 'src/app/shared/utilities/hide-keyboard.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PackingHeaderPageRoutingModule,
    SearchDropdownPageModule,
    CameraScanInputPageModule,
    IdMappingModule,
    NgCircleProgressModule,
    HideKeyboardModule,
    OfflineItemIdMappingModule
  ],
  declarations: [PackingHeaderPage]
})
export class PackingHeaderPageModule {}
