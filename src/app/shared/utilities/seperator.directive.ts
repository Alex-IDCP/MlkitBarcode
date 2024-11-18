import { Directive, ElementRef, HostListener } from "@angular/core";
import { IonInput } from "@ionic/angular";

@Directive({
   selector: '[separator]',
})
export class SeparatorDirective {

   constructor(private _inputEl: IonInput) { }

   @HostListener('ngModelChange')
   onNgModelChange() {
      if (this._inputEl.value === '-') return;
      let commasRemoved = this._inputEl.value.toString().replace(/,/g, '');
      let toInt: number;
      let toLocale: string;
      if (commasRemoved.split('.').length > 1) {
         let decimal = isNaN(parseInt(commasRemoved.split('.')[1])) ? '' : parseInt(commasRemoved.split('.')[1]);
         toInt = parseInt(commasRemoved);
         toLocale = toInt.toLocaleString('en-US') + '.' + decimal;
      } else {
         toInt = parseInt(commasRemoved);
         toLocale = toInt.toLocaleString('en-US');
      }
      if (toLocale === 'NaN') {
         this._inputEl.value = '';
      } else {
         this._inputEl.value = toLocale;
      }
   }
}
