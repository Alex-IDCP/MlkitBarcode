import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationApplicationAddPageRoutingModule } from './location-application-add-routing.module';

import { LocationApplicationAddPage } from './location-application-add.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationApplicationAddPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [LocationApplicationAddPage]
})
export class LocationApplicationAddPageModule {}
