import { Pipe, PipeTransform } from '@angular/core';
import { BinList } from 'src/app/modules/transactions/models/transfer-bin';

@Pipe({
   name: 'binMapping'
})
export class BinMappingPipe implements PipeTransform {

   transform(inputId: number, lookUpArray: BinList[]): string {
      var lookupValue = lookUpArray?.find(e => e.binId == inputId);
      if (lookupValue) {
         return lookupValue.binCode;
      } else {
         return inputId.toString();
      }
   }

}
