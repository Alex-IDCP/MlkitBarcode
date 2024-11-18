import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SigninPageRoutingModule } from './signin-routing.module';

import { SigninPage } from './signin.page';
import { CodeInputModule } from 'angular-code-input';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      SigninPageRoutingModule,
      ReactiveFormsModule,
      CodeInputModule
   ],
   declarations: [SigninPage]
})
export class SigninPageModule { }