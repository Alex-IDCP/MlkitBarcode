import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DoAcknowledgementPageRoutingModule } from './do-acknowledgement-routing.module';

import { DoAcknowledgementPage } from './do-acknowledgement.page';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { IdToCodeMappingModule } from 'src/app/shared/pipes/id-to-code-mapping/id-to-code-mapping.module';
import { SignaturePadModule } from 'angular2-signaturepad';
import { GeneralScanInputPageModule } from 'src/app/shared/pages/general-scan-input/general-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
   declarations: [DoAcknowledgementPage],
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DoAcknowledgementPageRoutingModule,
      SearchMultiDropdownPageModule,
      IdMappingModule,
      IdToCodeMappingModule,
      SignaturePadModule,
      GeneralScanInputPageModule,
      SearchDropdownPageModule
   ]
})
export class DoAcknowledgementPageModule { }
