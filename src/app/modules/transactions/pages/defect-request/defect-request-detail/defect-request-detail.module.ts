import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestDetailPageRoutingModule } from './defect-request-detail-routing.module';

import { DefectRequestDetailPage } from './defect-request-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DefectRequestDetailPageRoutingModule,
      IdMappingModule
   ],
   declarations: [DefectRequestDetailPage]
})
export class DefectRequestDetailPageModule { }
