import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationApplicationDetailPageRoutingModule } from './location-application-detail-routing.module';

import { LocationApplicationDetailPage } from './location-application-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';
import { IdToCodeMappingModule } from 'src/app/shared/pipes/id-to-code-mapping/id-to-code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationApplicationDetailPageRoutingModule,
    IdMappingModule,
    CodeMappingModule,
    IdToCodeMappingModule
  ],
  declarations: [LocationApplicationDetailPage]
})
export class LocationApplicationDetailPageModule {}
