import { Pipe, PipeTransform } from '@angular/core';
import { MasterListDetails } from '../../models/master-list-details';

@Pipe({
   name: 'idToCodeMapping'
})
export class IdToCodeMappingPipe implements PipeTransform {

   transform(inputId: number, lookUpArray: MasterListDetails[]): string {
      var lookupValue = lookUpArray?.find(e => e.id == inputId);

      return lookupValue != undefined ? lookupValue.code : "";
   }

}
