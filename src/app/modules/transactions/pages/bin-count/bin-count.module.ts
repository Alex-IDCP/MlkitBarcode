import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BinCountPageRoutingModule } from './bin-count-routing.module';

import { BinCountPage } from './bin-count.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BinCountPageRoutingModule,
    NgxPaginationModule
  ],
  declarations: [BinCountPage]
})
export class BinCountPageModule {}
