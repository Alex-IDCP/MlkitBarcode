import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserReloginPageRoutingModule } from './user-relogin-routing.module';

import { UserReloginPage } from './user-relogin.page';
import { CodeInputModule } from 'angular-code-input';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      UserReloginPageRoutingModule,
      CodeInputModule
   ],
   declarations: [UserReloginPage]
})
export class UserReloginPageModule { }
