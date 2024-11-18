import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PosApprovalProcessingPageRoutingModule } from './pos-approval-processing-routing.module';

import { PosApprovalProcessingPage } from './pos-approval-processing.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PosApprovalProcessingPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    PosApprovalProcessingPage
  ],
  declarations: [PosApprovalProcessingPage]
})
export class PosApprovalProcessingPageModule {}
