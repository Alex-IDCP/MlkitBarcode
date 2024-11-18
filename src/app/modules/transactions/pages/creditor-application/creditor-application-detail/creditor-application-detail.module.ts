import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditorApplicationDetailPageRoutingModule } from './creditor-application-detail-routing.module';

import { CreditorApplicationDetailPage } from './creditor-application-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      CreditorApplicationDetailPageRoutingModule,
      IdMappingModule,
      CodeMappingModule
   ],
   declarations: [CreditorApplicationDetailPage]
})
export class CreditorApplicationDetailPageModule { }
