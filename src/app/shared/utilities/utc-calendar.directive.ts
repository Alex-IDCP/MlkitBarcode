import { Directive, Host, HostListener, Self } from '@angular/core';
import { IonDatetime } from '@ionic/angular';

@Directive({
   selector: '[iCalendarUseUtc]'
})
export class UtcCalendarDirective {

   constructor(@Host() @Self() private calendar: IonDatetime) { }

   @HostListener('onSelect', ['$event']) onSelect() {
      this.toUtc();
   }

   @HostListener('onInput', ['$event']) onInput() {
      this.toUtc();
   }

   private toUtc() {
      // don't use this when getting multiple date
      if (this.calendar.value[0]) {
         let value = new Date(this.calendar.value[0]);
         this.calendar.value = new Date(Date.UTC(value.getFullYear()
            , value.getMonth()
            , value.getDate()
            , 0, 0, 0)).toISOString();
         // this.calendar.updateModel(this.calendar.value);
      }

   }

}
