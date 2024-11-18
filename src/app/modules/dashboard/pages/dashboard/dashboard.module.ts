import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { SanitizeHtmlModule } from 'src/app/shared/pipes/sanitize-html/sanitize-html.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    SumModule,
    SanitizeHtmlModule
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
