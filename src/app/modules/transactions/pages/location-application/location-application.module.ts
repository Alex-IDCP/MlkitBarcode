import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationApplicationPageRoutingModule } from './location-application-routing.module';

import { LocationApplicationPage } from './location-application.page';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationApplicationPageRoutingModule,
    CodeMappingModule
  ],
  declarations: [LocationApplicationPage]
})
export class LocationApplicationPageModule {}
