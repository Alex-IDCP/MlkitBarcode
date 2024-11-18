import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiCoTransactionProcessingPageRoutingModule } from './multico-transaction-processing-routing.module';

import { MultiCoTransactionProcessingPage } from './multico-transaction-processing.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      MultiCoTransactionProcessingPageRoutingModule,
      IdMappingModule
   ],
   exports: [
      MultiCoTransactionProcessingPage
   ],
   declarations: [MultiCoTransactionProcessingPage]
})
export class MultiCoTransactionProcessingPageModule { }
