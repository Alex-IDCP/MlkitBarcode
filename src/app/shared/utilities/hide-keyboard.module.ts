import { NgModule } from "@angular/core";
import { HideKeyboardDirective } from "./hide-keyboard.directive";

@NgModule({
   declarations: [
      HideKeyboardDirective
   ],
   exports: [
      HideKeyboardDirective
   ]
})
export default class HideKeyboardModule{}