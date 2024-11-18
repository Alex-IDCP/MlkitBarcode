import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCodeInputPageRoutingModule } from './item-code-input-routing.module';

import { ItemCodeInputPage } from './item-code-input.page';
import { IdToCodeMappingModule } from '../../pipes/id-to-code-mapping/id-to-code-mapping.module';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ItemCodeInputPageRoutingModule,
      IdToCodeMappingModule,
      IdMappingModule
   ],
   declarations: [ItemCodeInputPage],
   exports: [ItemCodeInputPage]
})
export class ItemCodeInputPageModule { }
