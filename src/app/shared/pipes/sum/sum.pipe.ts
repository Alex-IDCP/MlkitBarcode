import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  //Define as impure pipe to allow change detection during data value in object changes
  pure: false
})
export class SumPipe implements PipeTransform {

  transform(items: any[], attr: string): any {
    if(items != null){
      return items.reduce((a, b) => a + b[attr], 0);
    }else{
      return 0;
    }
  }
}
