import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardsPageRoutingModule } from './cards-routing.module';

import { CardsPage } from './cards.page';

// Swiper
import { SwiperModule } from 'swiper/angular';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsPageRoutingModule,
    SwiperModule,
    IdMappingModule
  ],
  declarations: [CardsPage]
})
export class CardsPageModule {}
