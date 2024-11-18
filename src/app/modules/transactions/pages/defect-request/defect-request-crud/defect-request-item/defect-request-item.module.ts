import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestItemPageRoutingModule } from './defect-request-item-routing.module';

import { DefectRequestItemPage } from './defect-request-item.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DefectRequestItemPageRoutingModule,
      IdMappingModule
   ],
   declarations: [DefectRequestItemPage]
})
export class DefectRequestItemPageModule { }
