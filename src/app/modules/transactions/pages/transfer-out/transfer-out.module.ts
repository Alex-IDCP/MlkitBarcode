import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutPageRoutingModule } from './transfer-out-routing.module';

import { TransferOutPage } from './transfer-out.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { CodeMappingModule } from 'src/app/shared/pipes/code-mapping/code-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      TransferOutPageRoutingModule,
      NgxPaginationModule,
      CodeMappingModule
   ],
   declarations: [TransferOutPage]
})
export class TransferOutPageModule { }
