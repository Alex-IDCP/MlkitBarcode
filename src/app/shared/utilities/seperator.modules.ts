import { NgModule } from "@angular/core";
import { SeparatorDirective } from "./seperator.directive";

@NgModule({
   declarations: [
      SeparatorDirective
   ],
   exports: [
      SeparatorDirective
   ]
})
export default class SeparatorModule{}