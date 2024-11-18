import { Directive, ElementRef, HostListener, NgModule, Renderer2 } from '@angular/core';

@Directive({
   selector: '[hideKeyboard]'
})

export class HideKeyboardDirective {
   private readonly: boolean;
   private focusTimeout = 0;

   constructor(private el: ElementRef, private renderer: Renderer2) {
      this.readonly = true;
      this.setReadOnly(this.readonly)

      setTimeout(() => {
         this.el.nativeElement.focus();
      }, this.focusTimeout);
   }

   @HostListener('focus') onFocus() {
      this.readonly = true;
      this.setReadOnly(this.readonly);

      if (!this.readonly) {
         this.setReadOnly(!this.readonly);
      }
      setTimeout(() => {
         this.readonly = false;
         this.setReadOnly(this.readonly);
      }, 100);
   };

   @HostListener('click', ['$event.target'])
   onClick(input) {
      this.readonly = true;
      this.setReadOnly(this.readonly);

      setTimeout(() => {
         this.readonly = false;
         this.setReadOnly(this.readonly);
         this.el.nativeElement.focus();
      }, this.focusTimeout);
   }

   @HostListener('keydown.enter', ['$event'])
   onEnter(event: KeyboardEvent) {
      this.readonly = true;
      this.setReadOnly(this.readonly);

      setTimeout(() => {
         this.readonly = false;
         this.setReadOnly(this.readonly);
         this.el.nativeElement.focus();
      }, this.focusTimeout);
   }

   private setReadOnly(value: boolean): void {
      this.el.nativeElement.readOnly = value;
      if (this.el.nativeElement.children && this.el.nativeElement.children.length > 0) {
         this.el.nativeElement.children[0].readOnly = value;
         if (this.el.nativeElement.children.length > 1) {
            this.el.nativeElement.children[1].readOnly = value;
         }
      };
   };

}
