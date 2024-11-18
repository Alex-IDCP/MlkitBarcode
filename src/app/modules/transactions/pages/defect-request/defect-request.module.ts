import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestPageRoutingModule } from './defect-request-routing.module';

import { DefectRequestPage } from './defect-request.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DefectRequestPageRoutingModule,
      NgxPaginationModule
   ],
   declarations: [DefectRequestPage]
})
export class DefectRequestPageModule { }
