import { Pipe, PipeTransform } from '@angular/core';
import { MasterListDetails } from '../../models/master-list-details';

@Pipe({
   name: 'idMapping'
})
export class IdMappingPipe implements PipeTransform {

   transform(inputId: number, lookUpArray: MasterListDetails[], lookUpTye?: string, objectName?: string): string {
      if (objectName) {
         var lookupValue = lookUpArray?.find(e => e.id == inputId && e.objectName == objectName);
      } else {
         var lookupValue = lookUpArray?.find(e => e.id == inputId);
      }

      if (lookUpTye == "attribute1") {
         return lookupValue != undefined ? lookupValue.attribute1 : "";
      } else {
         return lookupValue != undefined ? lookupValue.description : "";
      }
   }

}
