import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLoadingComponent } from './cusom-loading.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [CustomLoadingComponent],
  imports: [CommonModule, IonicModule],
  exports: [CustomLoadingComponent],
})
export class SharedModule {}
