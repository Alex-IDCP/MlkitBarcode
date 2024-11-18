import { APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Storage } from '@ionic/storage';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InitializeAppService } from './services/sqlite/initialize.app.service';
import { SQLiteService } from './services/sqlite/sqlite.service';
import { DatabaseService } from './services/sqlite/database.service';
import { MigrationService } from './services/sqlite/migration.service';
import { DetailService } from './services/sqlite/detail.service';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxSpinnerModule } from "ngx-spinner";
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { IdMappingModule } from './shared/pipes/id-mapping/id-mapping.module';
import { IdToCodeMappingModule } from './shared/pipes/id-to-code-mapping/id-to-code-mapping.module';
import HideKeyboardModule from './shared/utilities/hide-keyboard.module';

export function initializeFactory(init: InitializeAppService) {
   return () => init.initializeApp();
}

@NgModule({
   declarations: [
      AppComponent,
   ],
   schemas: [
      CUSTOM_ELEMENTS_SCHEMA
   ],
   imports: [
      BrowserModule,
      NgxSpinnerModule,
      IonicModule.forRoot({ mode: 'ios' }),
      ReactiveFormsModule,
      AppRoutingModule,
      BaseChartDirective,
      HttpClientModule,
      CommonModule,
      IonicModule,
      FormsModule,
      IdMappingModule,
      IdToCodeMappingModule,
      HideKeyboardModule,
      BrowserAnimationsModule,
      NgCircleProgressModule.forRoot({
         // set defaults here
         radius: 30,
         outerStrokeWidth: 5,
         innerStrokeWidth: 3,
         space: 2,
         titleFontSize: "15",
         outerStrokeColor: "#78C000",
         innerStrokeColor: "#C7E596",
         animation: false,
         animationDuration: 0,
         showSubtitle: false
      }),
      NgxPaginationModule
   ],
   providers: [
      File,
      FileOpener,
      AndroidPermissions,
      SQLiteService,
      DetailService,
      DatabaseService,
      InitializeAppService,
      { provide: APP_INITIALIZER, useFactory: initializeFactory, deps: [InitializeAppService], multi: true },
      MigrationService,
      { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      Storage,
      // Badge
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
