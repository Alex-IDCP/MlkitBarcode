import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanHeaderPageRoutingModule } from './inbound-scan-header-routing.module';

import { InboundScanHeaderPage } from './inbound-scan-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import HideKeyboardModule from 'src/app/shared/utilities/hide-keyboard.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      InboundScanHeaderPageRoutingModule,
      ReactiveFormsModule,
      SearchDropdownPageModule,
      HideKeyboardModule,
      IdMappingModule,
      CodeMappingModule,
      NgCircleProgressModule,
      CameraScanInputPageModule,
      OfflineItemIdMappingModule
   ],
   declarations: [InboundScanHeaderPage]
})
export class InboundScanHeaderPageModule { }
