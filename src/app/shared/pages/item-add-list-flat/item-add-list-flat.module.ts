import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemAddListFlatPageRoutingModule } from './item-add-list-flat-routing.module';

import { ItemAddListFlatPage } from './item-add-list-flat.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemAddListFlatPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    ItemAddListFlatPage
  ],
  declarations: [ItemAddListFlatPage]
})
export class ItemAddListFlatPageModule {}
