import { Pipe, PipeTransform } from '@angular/core';
import { MasterListDetails } from '../../models/master-list-details';

@Pipe({
   name: 'codeMapping',
   pure: false
})
export class CodeMappingPipe implements PipeTransform {

   transform(inputCode: string, lookUpArray: MasterListDetails[]): string {
      var lookupValue = lookUpArray?.find(e => e.code == inputCode);
      return lookupValue != undefined ? lookupValue.description : "";
   }

}
